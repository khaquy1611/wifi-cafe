import moment from 'moment';
import { Order, StatCustomerOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderCustomer = await Order.aggregate([
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
                    customer_id: { $ne: '0' },
                },
            },
            {
                $group: {
                    _id: {
                        customer_id: '$customer_id',
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    total_voucher: { $sum: '$discount_amount' },
                    time: { $last: '$time' },
                    customer_name: { $last: '$customer_name' },
                    customer_avatar: { $last: '$customer_avatar' },
                    group_id: { $last: '$group_id' },
                    store_id: { $last: '$store_id' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.customer_id',
                    count: 1,
                    total: 1,
                    total_voucher: 1,
                    customer_name: 1,
                    customer_avatar: 1,
                    group_id: 1,
                    store_id: 1,
                    time: 1,
                },
            },
        ]);
        await StatCustomerOrder.insertMany(statOrderCustomer);
    } catch (e) {
        logger.error(`stat_order_customer - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
