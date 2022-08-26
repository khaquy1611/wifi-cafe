import { LogAction } from '@smodel/index';
import { LogActionAdminType } from '@stypes/index';
import ErrorHandler from '@sexceptions/index';

export default async ({
    group_id,
    store_id,
    user_id,
    user_name,
    user_email,
    order_id,
    name,
    type,
    key,
}: LogActionAdminType) => {
    try {
        await new LogAction({
            name,
            type,
            key,
            user_id,
            user_name,
            user_email,
            group_id,
            store_id,
            order_id,
        }).save();
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};
