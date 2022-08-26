import moment from 'moment';
import { Order, StatOverviewOrder, StatOverviewPayment } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderOver = await Order.aggregate([
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
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    total_voucher: { $sum: '$discount_amount' },
                    time: { $last: '$time' },
                    name: { $last: '$store_name' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.store_id',
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
        await StatOverviewOrder.insertMany(statOrderOver);

        const statOrderPayment = await Order.aggregate([
            {
                $match: {
                    status_payment: 'completed',
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
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$total' },
                    time: { $last: '$time' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.store_id',
                    count: 1,
                    total: 1,
                    time: 1,
                    group_id: '$_id.group_id',
                    store_id: '$_id.store_id',
                },
            },
        ]);
        await StatOverviewPayment.insertMany(statOrderPayment);
    } catch (e) {
        logger.error(`stat_order_overview - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
