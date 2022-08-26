import { Request, Response } from 'express';
import { map, merge, keyBy, values, remove } from 'lodash';
import moment from 'moment';
import { Order, Store, Payment, Customer, SubDepartment, Department, OrderProduct, Transaction } from '@smodel/index';
import { randomString } from '@shelpers/index';
import catchAsync from '@sexceptions/CatchAsync';
import {
    checkStatusStore,
    checkStatusCoupon,
    saveStatusCoupon,
    cancelCoupon,
    checkVaildProduct,
    paymentMerchantAppotaPay,
    saveLogAdmin,
} from '@sservice/index';
import { platformType } from '@stypes/index';
import { PAYMENT_APPOTA } from '@sconfig/app';
import { getIosTokenIob } from '@squeue/index';
import { checkAndUpdateWareHouse } from '@sservice/WareHouse';

export const ordersCreateMachine = catchAsync(async (req: Request, res: Response) => {
    const req_machine = req.route.path === '/create/by/machine';
    const {
        store_id,
        list_products,
        machine_id,
        payment_method,
        total,
        bank_code,
        status_order,
        sub_department_id,
        type,
        discount_amount,
        discount_code,
        discount_id,
        discount_name,
        customer_phone_number,
    } = req.body;
    let store = null;
    if (req_machine) {
        store = await Store.findOne({ machine_id, active: true });
    } else {
        store = await Store.findById(store_id);
    }
    if (!store || !store.active) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không có thông tin cửa hàng hoặc cửa hàng tạm dừng phục vụ',
        });
    }
    const orderIdStore = store.orderId + 1;
    let orderCodeStore = store.order_code + 1;
    if (store.order_code >= store.order_card_table) {
        orderCodeStore = 1;
    }
    const orders = await checkStatusStore({
        group_id: store.group_id,
        store_id: store._id,
        store_name: store.name,
        payment_method,
        status_order,
        total,
        number: list_products.length,
        user_agent: req.headers['user-agent'] as string,
        ip: req.headers['x-real-ip'] as string,
        orderIdStore,
        orderCodeStore,
    });
    if (req_machine && orders.workspace_id !== req.body.miniAppUser.workspace_id) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Workspace không hợp lệ',
        });
    }
    const dataMergeProduct = await checkVaildProduct({
        group_id: orders.group_id,
        store_id: orders.store_id,
        total,
        list_products,
        order_id: orders._id,
    });
    const admin = req.body.cmsAdminUser;
    if (!req_machine) {
        orders.user_id = admin._id;
        orders.user_name = admin.name;
    }
    let sub_deparment = null;
    if (status_order === 'at-place') {
        sub_deparment = await SubDepartment.findById(sub_department_id, 'name department_id active store_id orders');
        if (!sub_deparment || !sub_deparment.active || sub_deparment.store_id !== store_id) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Không tìm thấy thông tin bàn hoặc bàn này ngưng phục vụ',
            });
        }
        const deparment = await Department.findById(sub_deparment.department_id, 'name active store_id');
        if (!deparment || !deparment.active || deparment.store_id !== store_id) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Không tìm thấy thông tin phòng hoặc phòng này ngưng phục vụ',
            });
        }
        orders.department_id = deparment._id;
        orders.department_name = deparment.name;
        orders.sub_department_id = sub_deparment._id;
        orders.sub_department_name = sub_deparment.name;
    }
    let customer = null;
    if (customer_phone_number) {
        customer = await Customer.findOne(
            { group_id: store.group_id, phone_number: customer_phone_number },
            'name avatar phone_number',
        );
        if (customer) {
            orders.customer_id = customer._id;
            orders.customer_name = customer.name;
            orders.customer_avatar = customer.avatar;
            orders.customer_phone_number = customer.phone_number;
        }
    }
    if (discount_code && discount_id && discount_name && discount_amount) {
        await checkStatusCoupon({
            group_id: orders.group_id,
            store_id: orders.store_id,
            total,
            list_products,
            code: discount_code,
            customer_id: orders.customer_id,
        });
        orders.discount_code = discount_code;
        orders.discount_id = discount_id;
        orders.discount_name = discount_name;
        orders.discount_amount = discount_amount;
    }
    let orderSave = null;
    let url = '';
    let transactionService = false;
    const amount = orders.discount_amount ? total - orders.discount_amount : total;
    if (amount <= 0) {
        orders.payment_method = 'MONEY';
        orders.payment_method_name = 'Tiền mặt';
        orders.status_payment = 'completed';
        await checkAndUpdateWareHouse({ group_id: store.group_id, list_products, orderId: orders.orderId });
    }
    if (PAYMENT_APPOTA.includes(orders.payment_method) && bank_code && amount > 0) {
        url = await paymentMerchantAppotaPay({
            _id: orders._id,
            store_id: store._id,
            id: orders.id,
            total: amount,
            bank_code,
            orderId: orders.orderId,
            payment_method,
        });
        transactionService = true;
    }
    const saveProductOrder = await OrderProduct.insertMany(dataMergeProduct);
    orders.products = map(saveProductOrder, '_id');
    orderSave = await orders.save();
    if (orderSave.discount_id) {
        await saveStatusCoupon({
            coupon_id: discount_id,
            customer_id: orderSave.customer_id,
        });
    }
    store.order_code = orderCodeStore;
    store.orderId = orderIdStore;
    await store.save();
    if (sub_deparment) {
        sub_deparment.status = status_order;
        sub_deparment.orders.push(orders._id);
        await sub_deparment.save();
    }
    if (transactionService) {
        const transaction = await new Transaction({
            group_id: orderSave.group_id,
            store_id: orderSave.store_id,
            amount,
            orderId: orderSave.orderId,
            order_id: orderSave._id,
            bank_code,
            payment_method: orderSave.payment_method,
        });
        await transaction.save();
        orderSave.bank_code = bank_code;
        orderSave.transaction_id = transaction._id;
        orderSave.payment_url = url;
    }
    await orderSave.save();
    if (!req_machine) {
        await saveLogAdmin({
            name: type === 'payment' ? 'bán đơn hàng' : 'tạo đơn hàng',
            type: type === 'payment' ? 'order_payment' : 'order_create',
            key: 'order',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id: store.group_id,
            store_id: store._id,
            order_id: `${orders.id} trị giá ${total.toLocaleString('en-AU')}`,
        });
        if (orderSave) {
            orderSave.list_products = saveProductOrder;
            orderSave.store = store;
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        url,
        data: req_machine ? {} : orderSave,
    });
});

export const ordersCreateByStaff = catchAsync(async (req: Request, res: Response) => {
    const {
        list_products,
        qr_code,
        payment_method,
        total,
        bank_code,
        status_order,
        discount_amount,
        discount_code,
        discount_id,
        discount_name,
        customer_phone_number,
        customer_name,
        customer_avatar,
        deviceToken,
        platform,
        store_in_app,
    } = req.body;
    const req_staff = req.route.path === '/create/by/staff';
    const req_app = req.route.path === '/create/by/app';
    let platformVoucher: platformType = 'web';

    if (req_staff) {
        platformVoucher = 'miniapp';
    } else if (req_app) {
        platformVoucher = 'app';
    } else if (store_in_app) {
        platformVoucher = 'in_app';
    }
    const split = qr_code.split('-');
    const store = await Store.findOne({ id: split[0], active: true });
    if (!store) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Mã QR-Code không hợp lệ hoặc cửa hàng tạm dừng phục vụ',
        });
    }
    const orderIdStore = store.orderId + 1;
    let orderCodeStore = store.order_code + 1;
    if (store.order_code >= store.order_card_table) {
        orderCodeStore = 1;
    }
    const orders = await checkStatusStore({
        group_id: store.group_id,
        store_id: store._id,
        store_name: store.name,
        payment_method,
        status_order,
        total,
        number: list_products.length,
        user_agent: req.headers['user-agent'] as string,
        ip: req.headers['x-real-ip'] as string,
        orderIdStore,
        orderCodeStore,
        deviceToken,
        platform,
    });
    if (req_staff && orders.workspace_id !== req.body.miniAppUser.workspace_id) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Workspace không hợp lệ',
        });
    }
    const dataMergeProduct = await checkVaildProduct({
        group_id: store.group_id,
        store_id: store._id,
        total,
        list_products,
        order_id: orders._id,
    });
    let sub_deparment = null;
    if (status_order === 'at-place') {
        sub_deparment = await SubDepartment.findOne(
            { id: qr_code, active: true, store_id: store._id },
            'name department_id status orders',
        );
        if (!sub_deparment) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Mã QR-Code không hợp lệ hoặc bàn này tạm dừng phục vụ',
            });
        }
        const deparment = await Department.findById(sub_deparment.department_id);
        if (!deparment || !deparment.active || deparment.store_id !== store._id.toString()) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Mã QR-Code không hợp lệ hoặc phòng này tạm dừng phục vụ',
            });
        }
        orders.department_id = deparment._id;
        orders.department_name = deparment.name;
        orders.sub_department_id = sub_deparment._id;
        orders.sub_department_name = sub_deparment.name;
    }
    let customer = null;
    if (req_app && customer_phone_number) {
        customer = await Customer.findOneAndUpdate(
            { group_id: store.group_id, phone_number: customer_phone_number },
            {
                name: customer_name,
                phone_number: customer_phone_number,
                avatar: customer_avatar,
                group_id: store.group_id,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            },
        );
    } else if (req_staff) {
        const { staff_id } = req.body.miniAppUser;
        customer = await Customer.findOne({ staff_id_code: staff_id });
    }
    if (customer) {
        orders.customer_id = customer._id;
        orders.customer_name = customer.name;
        orders.customer_avatar = customer.avatar;
        orders.customer_phone_number = customer.phone_number;
        orders.staff_id = customer.staff_id;
    }
    if (discount_code && discount_id && discount_name && discount_amount) {
        await checkStatusCoupon({
            group_id: store.group_id,
            store_id: store._id,
            total,
            list_products,
            code: discount_code,
            platform: platformVoucher,
            customer_id: orders.customer_id,
        });
        orders.discount_code = discount_code;
        orders.discount_id = discount_id;
        orders.discount_name = discount_name;
        orders.discount_amount = discount_amount;
    }
    let url = '';
    let transactionService = false;
    const amount = orders.discount_amount ? total - orders.discount_amount : total;
    if (amount <= 0) {
        orders.payment_method = 'MONEY';
        orders.payment_method_name = 'Tiền mặt';
        orders.status_payment = 'completed';
        await checkAndUpdateWareHouse({ group_id: store.group_id, list_products, orderId: orders.orderId });
    }
    if (PAYMENT_APPOTA.includes(orders.payment_method) && bank_code && amount > 0) {
        url = await paymentMerchantAppotaPay({
            _id: orders._id,
            store_id: store._id,
            id: orders.id,
            total: amount,
            bank_code,
            orderId: orders.orderId,
            payment_method,
            platform: platformVoucher,
            qr_code,
            order_code: orders.order_code,
        });
        transactionService = true;
    }
    const saveProductOrder = await OrderProduct.insertMany(dataMergeProduct);
    orders.products = map(saveProductOrder, '_id');
    const orderSave = await orders.save();
    if (orderSave.discount_id) {
        await saveStatusCoupon({
            coupon_id: discount_id,
            customer_id: orderSave.customer_id,
        });
    }
    store.orderId = orderIdStore;
    store.order_code = orderCodeStore;
    await store.save();
    if (sub_deparment) {
        sub_deparment.status = status_order;
        sub_deparment.orders.push(orders._id);
        await sub_deparment.save();
    }
    if (transactionService) {
        const transaction = await new Transaction({
            group_id: orderSave.group_id,
            store_id: orderSave.store_id,
            amount,
            orderId: orderSave.orderId,
            order_id: orderSave._id,
            bank_code: store_in_app ? 'IN_APP' : bank_code,
            payment_method: store_in_app ? 'IN_APP' : orderSave.payment_method,
        });
        await transaction.save();
        orderSave.bank_code = bank_code;
        orderSave.transaction_id = transaction._id;
        orderSave.payment_url = url;
    }
    if (store_in_app) {
        orderSave.payment_method = 'IN_APP';
        orderSave.bank_code = 'IN_APP';
        orderSave.payment_method_name = 'Tại quầy';
    }
    await orderSave.save();
    if (orderSave.deviceToken && orderSave.platform === 'ios') {
        getIosTokenIob({ id: orderSave._id, type: 'order' });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {
            _id: orderSave._id,
            customer_name: orderSave.customer_name,
            total: orderSave.total,
            discount_amount: orderSave.discount_amount,
            id: orderSave.id,
            payment_method_name: orderSave.payment_method_name,
            payment_url: orderSave.payment_url,
            group_ws: orderSave.workspace_id,
            order_code: orderSave.order_code,
        },
    });
});

export const ordersUpdate = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const {
        group_id,
        store_id,
        list_products,
        total,
        payment_method,
        status_order,
        bank_code,
        sub_department_id,
        type,
        discount_amount,
        discount_code,
        discount_id,
        discount_name,
        customer_phone_number,
    } = req.body;
    const admin = req.body.cmsAdminUser;
    const orderEdit = await Order.findById(orderId);
    if (
        !orderEdit ||
        orderEdit.status === 'completed' ||
        orderEdit.status === 'cancelled' ||
        orderEdit.status_payment === 'completed'
    ) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy đơn hàng hoặc đơn này đã được xử lý hoặc thanh toán',
        });
    }
    const listProducts = map(list_products, 'product_id');
    const listOrderProduct = await OrderProduct.find(
        {
            _id: { $in: orderEdit.products },
            product_id: { $in: listProducts },
        },
        'status number_recieve product_id -_id',
        { lean: true },
    );
    const dataProduct = await checkVaildProduct({
        group_id,
        store_id,
        total,
        list_products,
        order_id: orderEdit._id,
    });
    const dataMergeProduct = values(merge(keyBy(listOrderProduct, 'product_id'), keyBy(dataProduct, 'product_id')));
    const store = await Store.findById(store_id, 'group_id ip active name address phone_number message');
    if (!store || !store.active) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không có thông tin cửa hàng hoặc cửa hàng tạm dừng phục vụ',
        });
    }
    const payment = await Payment.findOne({ group_id, store_id, code: payment_method, key: 'payment', active: true });
    if (!payment) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Phương thức thanh toán không hợp lệ',
        });
    }
    let customer = null;
    if (customer_phone_number) {
        customer = await Customer.findOne(
            { group_id, phone_number: customer_phone_number },
            'name avatar phone_number',
        );
        if (!customer) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Không tìm thấy khách hàng với số điện thoại này',
            });
        }
    }
    if (discount_code && discount_id && discount_name) {
        if (orderEdit.discount_code && orderEdit.discount_code !== discount_code) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Vui lòng huỷ mã khuyến mãi cũ trước khi thêm mã khác',
            });
        }
        if (!orderEdit.discount_code) {
            await checkStatusCoupon({
                group_id,
                store_id,
                total,
                list_products,
                code: discount_code,
                ...(customer_phone_number && customer
                    ? {
                          customer_id: customer._id,
                      }
                    : {}),
            });
        }
    }
    let url = '';
    let transactionService = false;
    orderEdit.payment_method = payment_method;
    orderEdit.payment_method_name = payment.name;
    const amount = orderEdit.discount_amount ? total - orderEdit.discount_amount : total;
    if (amount <= 0) {
        orderEdit.payment_method = 'MONEY';
        orderEdit.payment_method_name = 'Tiền mặt';
    }
    if (PAYMENT_APPOTA.includes(orderEdit.payment_method) && bank_code && amount > 0) {
        const orderId = randomString(24, true);
        url = await paymentMerchantAppotaPay({
            _id: orderEdit._id,
            store_id,
            id: orderEdit.id,
            total: amount,
            bank_code,
            orderId,
            payment_method,
        });
        const transactionUpdate = await Transaction.findById(orderEdit.transaction_id);
        if (transactionUpdate) {
            transactionUpdate.orderId = orderId;
            transactionUpdate.payment_method = payment_method;
            transactionUpdate.bank_code = bank_code;
            await transactionUpdate.save();
        } else {
            transactionService = true;
        }
        orderEdit.bank_code = bank_code;
        orderEdit.orderId = orderId;
        orderEdit.payment_url = url;
    }
    if (!orderEdit.discount_id && discount_id) {
        await saveStatusCoupon({
            coupon_id: discount_id,
            ...(customer_phone_number && customer
                ? {
                      customer_id: customer._id,
                  }
                : {}),
        });
        orderEdit.discount_code = discount_code;
        orderEdit.discount_id = discount_id;
        orderEdit.discount_name = discount_name;
        orderEdit.discount_amount = discount_amount;
    }
    if (status_order === 'at-place') {
        if (!orderEdit.sub_department_id) {
            const sub_deparment = await SubDepartment.findById(
                sub_department_id,
                'name department_id active store_id orders status',
            );
            if (!sub_deparment || !sub_deparment.active || sub_deparment.store_id !== store_id) {
                return res.status(400).json({
                    errorCode: 4000,
                    message: 'Không tìm thấy thông tin bàn hoặc bàn này ngưng phục vụ',
                });
            }
            const deparment = await Department.findById(sub_deparment.department_id, 'name active store_id');
            if (!deparment || !deparment.active || deparment.store_id !== store_id) {
                return res.status(400).json({
                    errorCode: 4000,
                    message: 'Không tìm thấy thông tin phòng hoặc phòng này ngưng phục vụ',
                });
            }
            sub_deparment.orders.push(orderEdit._id);
            sub_deparment.status = status_order;
            await sub_deparment.save();
            orderEdit.department_id = deparment._id;
            orderEdit.department_name = deparment.name;
            orderEdit.sub_department_id = sub_deparment._id;
            orderEdit.sub_department_name = sub_deparment.name;
        }
    } else {
        if (orderEdit.sub_department_id) {
            const sub_deparment_remove = await SubDepartment.findById(orderEdit.sub_department_id, 'orders');
            if (sub_deparment_remove) {
                const storeArray = sub_deparment_remove.orders.map(String);
                remove(storeArray, (n) => {
                    return n === orderEdit._id.toString();
                });
                sub_deparment_remove.orders = storeArray;
                if (storeArray.length < 1) {
                    sub_deparment_remove.status = '';
                }
                await sub_deparment_remove.save();
            }
        }
        orderEdit.department_id = '';
        orderEdit.department_name = '';
        orderEdit.sub_department_id = '';
        orderEdit.sub_department_name = '';
    }
    if (customer_phone_number && customer) {
        orderEdit.customer_phone_number = customer.phone_number;
        orderEdit.customer_id = customer._id;
        orderEdit.customer_name = customer.name;
        orderEdit.customer_avatar = customer.avatar;
    }
    await OrderProduct.deleteMany({ order_id: orderEdit._id });
    const saveProductOrder = await OrderProduct.insertMany(dataMergeProduct);
    orderEdit.products = map(saveProductOrder, '_id');
    orderEdit.user_id = admin._id;
    orderEdit.user_name = admin.name;
    orderEdit.user_avatar = admin.avatar;
    orderEdit.total = total;
    orderEdit.status_order = status_order;
    orderEdit.status_order_name = status_order === 'at-place' ? 'Ăn tại bàn' : 'Mang về';
    orderEdit.number = dataMergeProduct.length;
    orderEdit.status = 'processing';
    if (transactionService) {
        const transaction = await new Transaction({
            group_id,
            store_id,
            amount,
            orderId,
            order_id: orderEdit._id,
            bank_code,
            payment_method: orderEdit.payment_method,
        });
        await transaction.save();
        orderEdit.transaction_id = transaction._id;
    }
    await orderEdit.save();
    if (type === 'payment') {
        await saveLogAdmin({
            name: 'bán đơn hàng',
            type: 'order_payment',
            key: 'order',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: `${orderEdit.id} trị giá ${total.toLocaleString('en-AU')}`,
        });
    }
    orderEdit.list_products = saveProductOrder;
    orderEdit.store = store;
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        url,
        data: orderEdit,
    });
});

export const ordersUpdateStatus = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { group_id, store_id, type, note } = req.body;
    const admin = req.body.cmsAdminUser;
    const orderEdit = await Order.findById(orderId).populate({
        path: 'products',
        select: 'quantity product_id',
    });
    if (!orderEdit || orderEdit.status === 'completed' || orderEdit.status === 'cancelled') {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy đơn hàng hoặc đơn này đã được xử lý',
        });
    }
    let message = 'Cập nhật thành công';
    if (type === 'cancel_order') {
        if (orderEdit.status_service === 'completed' || orderEdit.status_payment === 'completed') {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Đơn này không hủy được vì đã thanh toán hoặc đã giao món',
            });
        }
        orderEdit.status = 'cancelled';
        message = `Đơn hàng ${orderEdit.id} đã bị huỷ`;
        await saveLogAdmin({
            name: `huỷ đơn hàng`,
            type: 'order_cancel',
            key: 'order',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: `${orderEdit.id} trị giá ${orderEdit.total.toLocaleString('en-AU')}`,
        });

        if (orderEdit.discount_code) {
            cancelCoupon({ order_id: orderEdit._id });
        }
    } else if (type === 'complete_service') {
        orderEdit.status_service = 'completed';
        message = `Đơn hàng ${orderEdit.id} đã giao món cho khách`;
        orderEdit.status = 'processing';
        if (orderEdit.status_payment === 'completed') {
            orderEdit.status = 'completed';
            message = `Đơn hàng ${orderEdit.id} đã được hoàn thành`;
        }
    } else if (type === 'complete_payment') {
        if (orderEdit.payment_method !== 'MONEY') {
            return res.status(400).json({
                errorCode: 4000,
                message: `Đây là đơn thanh toán bằng ${orderEdit.payment_method_name}, chờ khách tự thanh toán`,
            });
        }
        orderEdit.status_payment = 'completed';
        const list_products = orderEdit.products.map((product: any) => {
            return {
                product_id: product.product_id,
                quantity: product.quantity,
            };
        });
        await checkAndUpdateWareHouse({ group_id, list_products, orderId: orderEdit.orderId });
        message = `Đơn hàng ${orderEdit.id} đã được khách thanh toán`;
        orderEdit.status = 'processing';
        orderEdit.date_payment = moment().unix();
        if (orderEdit.status_service === 'completed') {
            orderEdit.status = 'completed';
            message = `Đơn hàng ${orderEdit.id} đã được hoàn thành`;
        }
    }
    orderEdit.user_id = admin._id;
    orderEdit.user_name = admin.name;
    orderEdit.user_avatar = admin.avatar;
    orderEdit.note = note;
    if (moment(orderEdit.createdAt).format('DDMMYYYY') !== moment().format('DDMMYYYY')) {
        orderEdit.order_closing = 'late';
        orderEdit.order_closing_note = `Đơn được duyệt ngày ${moment().format('DD/MM/YYYY HH:mm')}`;
    }
    await orderEdit.save();
    if (orderEdit.status === 'completed') {
        await OrderProduct.updateMany({ order_id: orderEdit._id }, { status: 'completed' });
    }
    return res.status(200).json({
        errorCode: 0,
        message,
    });
});

export const ordersUpdateQuantity = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const orderEdit = await OrderProduct.findById(productId);
    if (!orderEdit) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy sản phẩm hoặc sản phẩm này đã được xử lý',
        });
    }
    orderEdit.number_recieve = quantity;
    await orderEdit.save();
    return res.status(201).json({
        errorCode: 0,
        message: 'success',
    });
});

export const ordersShow = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { group_id, store_id } = req.query;
    const req_app = req.route.path === '/detail/app/:orderId';
    let select = '';
    if (req_app) {
        select =
            'payment_url workspace_id id status_order sub_department_name department_name order_code createdAt payment_method_name status_payment status_service status list_products total discount_amount';
    }
    const data = await Order.findById(orderId, select, { lean: true }).populate({
        match: {
            group_id,
            store_id,
        },
        path: 'products',
    });
    data.list_products = data.products;
    delete data.products;
    if (!req_app) {
        const store = await Store.findById(store_id, 'name address phone_number message');
        data.store = store;
    } else if (req_app && data.workspace_id !== req.body.miniAppUser.workspace_id) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Workspace không hợp lệ',
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const ordersIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id } = req.query;
    const data = await Order.find({
        group_id: group_id as string,
        store_id: store_id as string,
        status: { $in: ['pending', 'processing'] },
    }).populate({
        path: 'products',
        select: 'number_recieve name quantity',
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
