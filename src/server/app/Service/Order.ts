import { map, isEqual } from 'lodash';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { GroupStore, Payment, Order, Notify, Transaction, OrderProduct, Product, Store } from '@smodel/index';
import { randomString } from '@shelpers/index';
import { DataCreateOrderProduct, DataAppotaPay, DataVaildProduct, DataCheckStore, IDataBank } from '@stypes/index';
// import { pushNotifyJob } from '@squeue/index';
import BankMerchant from '@svendor/BankMerchant';

import ErrorHandler from '@sexceptions/index';
import { checkAndUpdateWareHouse } from './WareHouse';

const message = '[Thanh toán qua Appotapay]';

export const getInfoPayment = async ({ store_id }: { store_id: string }) => {
    try {
        const payment = await Store.findById(store_id);
        if (!payment || !payment.active) {
            throw new Error('Không tìm thấy thông tin cửa hàng hoặc tạm dừng hoạt động');
        }
        return payment;
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const checkVaildProduct = async ({ group_id, store_id, total, list_products, order_id }: DataVaildProduct) => {
    try {
        const listProducts = map(list_products, 'product_id');
        const products = await Product.find(
            {
                _id: { $in: listProducts },
                group_id,
            },
            'name logo price',
        ).sort('name');
        const dataMergeProduct: Array<DataCreateOrderProduct> = [];
        const dataOrderProduct: Array<DataCreateOrderProduct> = [];
        let total_amount = 0;
        products.forEach(async (element, key: number) => {
            dataMergeProduct.push({
                product_id: element._id.toString(),
                name: element.name,
                logo: element.logo,
                price: element.price,
                order_id,
                group_id,
                store_id,
                quantity: list_products[key].quantity,
                note: list_products[key].note,
                time: moment()
                    .set({
                        hour: 6,
                        minute: 0,
                        second: 0,
                    })
                    .unix(),
            });
            dataOrderProduct.push({
                product_id: list_products[key].product_id,
                name: list_products[key].name,
                logo: list_products[key].logo,
                price: list_products[key].price,
                order_id,
                group_id,
                store_id,
                quantity: list_products[key].quantity,
                note: list_products[key].note,
                time: moment()
                    .set({
                        hour: 6,
                        minute: 0,
                        second: 0,
                    })
                    .unix(),
            });
            total_amount += element.price * list_products[key].quantity;
        });
        if (!isEqual(dataMergeProduct, dataOrderProduct) || total_amount !== total) {
            throw new Error('Món không hợp lệ hoặc tổng tiền không đúng');
        }
        return dataMergeProduct;
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const paymentMerchantAppotaPay = async ({
    _id,
    store_id,
    id,
    total,
    bank_code,
    orderId,
    payment_method,
    platform,
    order_code,
}: DataAppotaPay) => {
    try {
        const inApp = platform === 'in_app' && payment_method === 'EWALLET';
        const payment = await getInfoPayment({ store_id });
        const { ip, partner_code, api_key } = payment;
        const message = `Thanh toán đơn hàng số ${id}`;
        const redirectUrl = `${process.env.API_URL}/redirect?orderCodeTable=${order_code}`;
        let valueData = `amount=${total}&bankCode=${bank_code}&clientIp=${ip}&extraData=${_id}&notifyUrl=${process.env.API_URL}/callback/ipn&orderId=${orderId}&orderInfo=${message}&paymentMethod=${payment_method}&redirectUrl=${redirectUrl}`;
        if (inApp) {
            valueData = `amount=${total}&clientIp=${ip}&extraData=${_id}&notifyUrl=${process.env.API_URL}/callback/ipn&orderId=${orderId}&orderInfo=${message}&redirectUrl=${redirectUrl}`;
        }
        const signature = crypto.createHmac('sha256', payment.secret_key).update(valueData).digest('hex');
        const token = jwt.sign(
            {
                iss: partner_code,
                jti: `${api_key}-${new Date().getTime()}`,
                api_key,
            },
            payment.secret_key,
            { expiresIn: '1h' },
        );
        const data = {
            amount: total,
            orderId,
            orderInfo: message,
            ...(inApp ? {} : { bankCode: bank_code }),
            ...(inApp ? {} : { paymentMethod: payment_method }),
            clientIp: ip,
            extraData: _id,
            notifyUrl: `${process.env.API_URL}/callback/ipn`,
            redirectUrl,
            signature,
        };
        let url = process.env.API_PAYMENT_BANK;
        if (inApp) {
            url = process.env.API_PAYMENT_QRCODE;
        }
        const request_payment = (await BankMerchant({
            url: url as string,
            method: 'POST',
            data,
            token,
        })) as {
            paymentUrl: string;
            qrData: {
                qrCodeUrl: string;
            };
        };
        let urlPayment = request_payment.paymentUrl;
        if (inApp) {
            urlPayment = request_payment.qrData.qrCodeUrl;
        }
        return urlPayment;
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const checkStatusStore = async ({
    group_id,
    store_id,
    store_name,
    payment_method,
    status_order,
    total,
    number,
    user_agent,
    ip,
    orderIdStore,
    orderCodeStore,
    deviceToken,
    platform,
}: DataCheckStore) => {
    try {
        const groupStore = await GroupStore.findById(group_id);
        if (!groupStore || !groupStore.active) {
            throw new Error('Mã QR-Code không hợp lệ hoặc cửa hàng tạm dừng phục vụ');
        }
        const payment = await Payment.findOne({ group_id, code: payment_method, key: 'payment', active: true }, 'name');
        if (!payment) {
            throw new Error('Phương thức thanh toán không hợp lệ');
        }
        return await new Order({
            workspace_id: groupStore.workspace_id,
            group_id,
            store_id,
            store_name,
            id: `HD${moment().format('DDMMYYYY')}-0${orderIdStore}`,
            order_code: orderCodeStore,
            orderId: randomString(24, true),
            status_order,
            status_order_name: status_order === 'at-place' ? 'Ăn tại bàn' : 'Mang về',
            total,
            payment_method,
            payment_method_name: payment.name,
            number,
            customer_user_agent: user_agent,
            customer_ip_address: ip,
            deviceToken,
            platform,
            time: moment()
                .set({
                    hour: 6,
                    minute: 0,
                    second: 0,
                })
                .unix(),
        });
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const callBackBank = async (body: IDataBank) => {
    try {
        const {
            errorCode,
            amount,
            currency,
            paymentType,
            appotapayTransId,
            transactionTs,
            extraData,
            message,
            apiKey,
            bankCode,
            orderId,
            partnerCode,
            paymentMethod,
            signature,
        } = body;
        const order = await Order.findById(extraData).populate({
            path: 'products',
            select: 'quantity product_id',
        });
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }
        const payment = await getInfoPayment({ store_id: order.store_id });
        const valueData = `amount=${amount}&apiKey=${apiKey}&appotapayTransId=${appotapayTransId}&bankCode=${bankCode}&currency=${currency}&errorCode=${errorCode}&extraData=${extraData}&message=${message}&orderId=${orderId}&partnerCode=${partnerCode}&paymentMethod=${paymentMethod}&paymentType=${paymentType}&transactionTs=${transactionTs}`;
        const hashSignature = crypto.createHmac('sha256', payment.secret_key).update(valueData).digest('hex');
        if (hashSignature !== signature) {
            throw new Error('Chữ ký không hợp lệ');
        }
        const data = await Transaction.findById(order.transaction_id);
        if (!data) {
            throw new Error('Không tìm thấy giao dịch');
        }
        let messageSocket = 'thanh toán thất bại';
        if (errorCode === 0) {
            messageSocket = 'thanh toán thành công';
        }
        data.status = errorCode === 0 ? 'completed' : 'failed';
        data.amount_bank = amount;
        data.currency = currency;
        data.payment_type = paymentType;
        data.appotapay_trans_id = appotapayTransId;
        data.transaction_ts = transactionTs;
        data.extra_data = extraData;
        data.message = message;
        data.error_code = errorCode;
        if (data.payment_method === 'IN_APP') {
            data.payment_method = paymentMethod;
            data.bank_code = bankCode;
        }
        if (order.payment_method === 'IN_APP') {
            const payment_info = await Payment.findOne(
                { group_id: order.group_id, code: paymentMethod, key: 'payment', active: true },
                'name',
            );
            order.payment_method = paymentMethod;
            if (payment_info) {
                order.payment_method_name = payment_info.name;
            }
            order.bank_code = bankCode;
        }
        await data.save();
        order.status_payment = data.status;
        order.status = 'processing';
        if (order.status_payment === 'completed') {
            const list_products = order.products.map((product: any) => ({
                product_id: product.product_id,
                quantity: product.quantity,
            }));
            await checkAndUpdateWareHouse({ group_id: order.group_id, list_products, orderId });
        }
        if (order.status_payment === 'completed' && order.status_service === 'completed') {
            order.status = 'completed';
        }
        order.date_payment = Math.floor(Date.now() / 1000);
        await order.save();
        if (order.status === 'completed') {
            await OrderProduct.updateMany({ order_id: order._id }, { status: 'completed' });
        }
        // pushNotifyJob({
        //     group_id: order.group_id,
        //     store_id: order.store_id,
        //     total: order.total,
        //     discount_amount: order.discount_amount,
        //     customer_name: order.customer_name,
        // });
        return {
            errorCode: 0,
            message: messageSocket,
            store_id: order.store_id,
            order_id: order.id,
            orderId: order._id,
        };
    } catch (e) {
        throw new ErrorHandler({ message: `${message} ${e.message}`, messageResponse: e.message });
    }
};

export const notifyMessage = async (store_id: string, message: string, icon: string, orderId = '', order_id = '') => {
    await new Notify({ store_id, message, icon, orderId, order_id }).save();
};
