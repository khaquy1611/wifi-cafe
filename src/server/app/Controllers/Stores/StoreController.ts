import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import { Admin, Store } from '@smodel/index';
import { ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN, ROLE_ADMIN, HIDE_SELECT_SECRET } from '@sconfig/app';
import { randomString } from '@shelpers/index';
import catchAsync from '@sexceptions/CatchAsync';

export const storesCreate = catchAsync(async (req: Request, res: Response) => {
    const admin = req.body.cmsAdminUser;
    if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
        await new Store({
            ...req.body,
            location: { type: 'Point', coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
            id: randomString(6),
        }).save();
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(403).json({
        errorCode: 4030,
        message: 'Không có quyền truy cập',
    });
});

export const storesUpdate = catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const admin = req.body.cmsAdminUser;
    if (admin.role === ROLE_ADMIN && !admin.stores.includes(storeId)) {
        return res.status(403).json({
            errorCode: 4030,
            message: 'Không có quyền truy cập',
        });
    }
    delete req.body.group_id;
    await Store.findByIdAndUpdate(storeId, {
        ...req.body,
        location: { type: 'Point', coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const storesIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id } = req.query;
    const parsedCookies = parseCookies({ req });
    const token = req.header('Authorization') || parsedCookies.tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true }, 'role groupStores');
    let data = [];
    if (admin) {
        if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
            data = await Store.find({ group_id: group_id as string }, HIDE_SELECT_SECRET).sort('order');
        } else if (admin.role === ROLE_ADMIN) {
            if (!admin.groupStores.includes(group_id as string)) {
                return res.status(403).json({
                    errorCode: 4030,
                    message: 'Không có quyền truy cập',
                });
            }
            const storeAdmin = await Admin.findById(admin._id, 'stores', { lean: true }).populate({
                path: 'stores',
                select: HIDE_SELECT_SECRET,
                match: { group_id: { $eq: group_id } },
                options: { sort: { order: 1 } },
            });
            if (storeAdmin) {
                data = storeAdmin.stores;
            }
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
