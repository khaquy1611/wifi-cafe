import { Request, Response } from 'express';
import { ReceiptType } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin } from '@sservice/index';
import { pick } from 'lodash';

export const create = catchAsync(async (req: Request, res: Response) => {
    const values = req.body;
    const checkExist = await ReceiptType.findOne({
        type: values.type,
        name: values.name,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (checkExist) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Loại phiếu đã tồn tại',
        });
        return;
    }
    await new ReceiptType(values).save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: 'thêm mới loại phiếu',
        type: 'create',
        key: 'ware_house',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: req.body.name,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const list = catchAsync(async (req: Request, res: Response) => {
    const values = { ...pick(req.query, ['group_id', 'store_id', 'type', 'name']) } as {
        group_id: string;
        store_id: string;
        type?: string;
        name?:
            | {
                  $regex: string;
                  $options: string;
              }
            | string;
    };
    const { page } = req.query;
    if (values.name) {
        values.name = { $regex: values.name as string, $options: 'i' };
    }
    const total = await ReceiptType.countDocuments(values);
    const data = await ReceiptType.find(values, {}, { skip: page ? (Number(page) - 1) * 10 : 0, limit: 10 }).sort({
        createdAt: -1,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total,
    });
});
