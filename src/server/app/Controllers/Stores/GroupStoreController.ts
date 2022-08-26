import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import { GroupStore, Admin } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN, HIDE_SELECT_SECRET } from '@sconfig/app';

export const groupStoresCreate = catchAsync(async (req: Request, res: Response) => {
    const admin = req.body.cmsAdminUser;
    if (admin.role !== ROLE_SUPER_ADMIN) {
        return res.status(403).json({
            errorCode: 4030,
            message: 'Không có quyền truy cập',
        });
    }
    await new GroupStore({
        ...req.body,
        ip: process.env.IP_SERVER,
        id: Math.random().toString(36).substring(2, 15),
    }).save();
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const groupStoresUpdate = catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const admin = req.body.cmsAdminUser;
    if (![ROLE_SUPER_ADMIN, ROLE_GROUP_ADMIN].includes(admin.role)) {
        return res.status(403).json({
            errorCode: 4030,
            message: 'Không có quyền truy cập',
        });
    }
    await GroupStore.findByIdAndUpdate(groupId, req.body);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const groupStoresIndex = catchAsync(async (req: Request, res: Response) => {
    const { tokenqr } = parseCookies({ req });
    const token = req.header('Authorization') || tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true });
    let data = [];
    if (admin) {
        if (admin.role === ROLE_SUPER_ADMIN) {
            data = await GroupStore.find({}, HIDE_SELECT_SECRET).sort('order');
        } else {
            const groupShopAdmin = await Admin.findById(admin._id, '', { lean: true }).populate({
                path: 'groupStores',
                options: { sort: { order: 1 } },
                select: HIDE_SELECT_SECRET,
            });
            data = groupShopAdmin?.groupStores;
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
