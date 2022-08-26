import moment from 'moment';
import { Order, StatPaymentOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderPayment = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    time: moment()
                        .subtract(1, 'days')
                        .set({
                            hour: 6,
                            minute: 0,
                            second: 0,
                        })
                        .unix(),
                },
            },
            {
                $group: {
                    _id: {
                        payment_method: '$payment_method',
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    time: { $last: '$time' },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    total_voucher: { $sum: '$discount_amount' },
                    name: { $last: '$payment_method_name' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.payment_method',
                    count: 1,
                    total: 1,
                    total_voucher: 1,
                    time: 1,
                    name: 1,
                    group_id: '$_id.group_id',
                    store_id: '$_id.store_id',
                },
            },
        ]);
        await StatPaymentOrder.insertMany(statOrderPayment);
    } catch (e) {
        logger.error(`stat_order_payment - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
