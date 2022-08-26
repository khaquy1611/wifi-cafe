import { Request, Response } from 'express';
import { Payment, Order, Customer, Transaction } from '@smodel/index';
import { randomString } from '@shelpers/index';
import { PAYMENT_APPOTA } from '@sconfig/app';
import { paymentMerchantAppotaPay } from '@sservice/index';
import catchAsync from '@sexceptions/CatchAsync';

export const paymentMethodUpdate = catchAsync(async (req: Request, res: Response) => {
    const { paymentMethodId } = req.params;
    delete req.body.group_id;
    delete req.body.store_id;
    await Payment.findByIdAndUpdate(paymentMethodId, req.body);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const paymentMethodIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id } = req.query;
    const data = await Payment.find(
        { group_id, store_id, key: 'payment' },
        'group_id code desc name order active',
    ).sort('order');
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const paymentOrderIndex = catchAsync(async (req: Request, res: Response) => {
    const { order_id, user_id } = req.body;
    const order = await Order.findById(order_id);
    if (!order) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Đơn hàng không hợp lệ',
        });
    }
    if (order.status_payment === 'completed' || order.status === 'completed') {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Đơn hàng đã được thanh toán',
        });
    }
    const customer = await Customer.findById(user_id);
    if (!customer) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy thông tin khách hàng, vui lòng quét lại mã để tiếp tục',
        });
    }
    order.customer_id = user_id;
    order.customer_name = customer.name;
    order.customer_avatar = customer.avatar;
    order.customer_phone_number = customer.phone_number;
    order.customer_ip_address = req.headers['x-real-ip'] as string;
    order.customer_user_agent = req.headers['user-agent'] as string;
    await order.save();
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        url: order.payment_url,
    });
});

export const paymentRequestOrder = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, order_id, platform } = req.body;
    const order = await Order.findById(order_id);
    if (
        !order ||
        order.status === 'completed' ||
        order.status === 'cancelled' ||
        order.status_payment === 'completed' ||
        group_id !== order.group_id ||
        store_id !== order.store_id ||
        req.body.miniAppUser.workspace_id !== order.workspace_id
    ) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy đơn hàng hoặc đơn này đã được xử lý hoặc thanh toán',
        });
    }
    const transactionUpdate = await Transaction.findById(order.transaction_id);
    if (!transactionUpdate || transactionUpdate.status !== 'pending') {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy giao dịch hoặc giao dịch này đã được xử lý',
        });
    }
    let url = '';
    if (!PAYMENT_APPOTA.includes(order.payment_method) && order.bank_code) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Phương thức thanh toán không hợp lệ',
        });
    }
    const orderId = randomString(24, true);
    const total = order.discount_amount ? order.total - order.discount_amount : order.total;
    url = await paymentMerchantAppotaPay({
        _id: order._id,
        store_id: order.store_id,
        id: order.id,
        total,
        bank_code: order.bank_code,
        orderId,
        payment_method: order.payment_method,
        platform,
    });
    transactionUpdate.orderId = orderId;
    order.orderId = orderId;
    order.payment_url = url;
    await transactionUpdate.save();
    await order.save();
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        url: order.payment_url,
    });
});
