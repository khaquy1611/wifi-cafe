import moment from 'moment';
import { Order, StatStatusOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderType = await Order.aggregate([
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
                        status_order: '$status_order',
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    total_voucher: { $sum: '$discount_amount' },
                    time: { $last: '$time' },
                    name: { $last: '$status_order_name' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.status_order',
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
        await StatStatusOrder.insertMany(statOrderType);
    } catch (e) {
        logger.error(`stat_order_type - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
