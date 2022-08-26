import { Request, Response } from 'express';
import isEmpty from 'lodash/isEmpty';
import { Notify, LogAction } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';

export const notifyMessageIndex = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    const data = await Notify.find({ store_id }, '', { skip: 0, limit: 100 }).sort('-createdAt');
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const notifyMessageRead = catchAsync(async (req: Request, res: Response) => {
    const { notify_id, store_id } = req.body;
    if (notify_id) {
        await Notify.findByIdAndUpdate(notify_id, { unread: false });
    } else {
        await Notify.updateMany({ store_id }, { unread: false });
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const logActionIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, offset, key, user_id } = req.query;
    const query = {
        group_id: group_id as string,
        store_id: store_id as string,
        ...(!isEmpty(key) ? { key: key as string } : {}),
        ...(!isEmpty(user_id) ? { user_id: user_id as string } : {}),
    };
    const skip: number = offset ? Number(offset) : 0;
    const data = await LogAction.find(query, '-updatedAt -group_id', { skip, limit: 10 }).sort('-createdAt');
    const countQuery = await LogAction.countDocuments(query);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});
