import moment from 'moment';
import { OrderProduct, StatProductOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        const statOrderProduct = await OrderProduct.aggregate([
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
                        product_id: '$product_id',
                        group_id: '$group_id',
                        store_id: '$store_id',
                    },
                    time: { $last: '$time' },
                    name: { $last: '$name' },
                    logo: { $last: '$logo' },
                    count: { $sum: 1 },
                    total: { $sum: '$quantity' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id.product_id',
                    count: 1,
                    total: 1,
                    time: 1,
                    name: 1,
                    logo: 1,
                    group_id: '$_id.group_id',
                    store_id: '$_id.store_id',
                },
            },
        ]);
        await StatProductOrder.insertMany(statOrderProduct);
    } catch (e) {
        logger.error(`stat_order_product - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
