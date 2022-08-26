import { CookieOrder } from '@smodel/index';
import logger from '@svendor/Logger';

export default async () => {
    try {
        await CookieOrder.deleteMany({});
    } catch (e) {
        logger.error(`cookie_order - Message: ${e.message} - Stack: ${e.stack}`);
    }
};
