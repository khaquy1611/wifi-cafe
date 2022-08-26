import { Notify, Store, CouponCustomer } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        await Notify.deleteMany({});
        await Store.updateMany({}, { orderId: 0, order_code: 0 });
        await CouponCustomer.updateMany({}, { usage_count_by_day: 0 });
    } catch (e) {
        logger.error(`notify - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
