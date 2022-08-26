import moment from 'moment';
import { Order, StatUserOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderUser = await Order.aggregate([
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
                    user_id: { $exists: true, $ne: '' },
                },
            },
            {
                $group: {
                    _id: {
                        user_id: '$user_id',
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    total_voucher: { $sum: '$discount_amount' },
                    time: { $last: '$time' },
                    user_name: { $last: '$user_name' },
                    user_avatar: { $last: '$user_avatar' },
                    group_id: { $last: '$group_id' },
                    store_id: { $last: '$store_id' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.user_id',
                    count: 1,
                    total: 1,
                    total_voucher: 1,
                    user_name: 1,
                    user_avatar: 1,
                    group_id: 1,
                    store_id: 1,
                    time: 1,
                },
            },
        ]);
        await StatUserOrder.insertMany(statOrderUser);
    } catch (e) {
        logger.error(`stat_order_user - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
