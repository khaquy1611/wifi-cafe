import { Request, Response } from 'express';
import { Department, SubDepartment } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin } from '@sservice/index';

export const storesDepartmentCreate = catchAsync(async (req: Request, res: Response) => {
    await new Department(req.body).save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới phòng`,
        type: 'create',
        key: 'department',
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

export const storesDepartmentUpdate = catchAsync(async (req: Request, res: Response) => {
    const { deparmentId } = req.params;
    const { group_id, store_id } = req.body;
    delete req.body.store_id;
    const data = await Department.findByIdAndUpdate(deparmentId, req.body);
    if (data) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `sửa phòng`,
            type: 'edit',
            key: 'department',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: req.body.name,
        });
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const storesDepartmentDelete = catchAsync(async (req: Request, res: Response) => {
    const { deparmentId } = req.params;
    const data = await SubDepartment.findOne({ department_id: deparmentId });
    if (data) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Tồn tại bàn của phòng này',
        });
    }
    const department = await Department.findByIdAndDelete(deparmentId);
    if (department) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `xoá phòng`,
            type: 'delete',
            key: 'department',
            order_id: department.name,
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id: req.body.group_id,
            store_id: req.body.store_id,
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const storesDepartmentIndex = catchAsync(async (req: Request, res: Response) => {
    const { store_id, app } = req.query;
    let select = '';
    // let path = 'orders';
    // let products = 'products';
    const match: {
        active?: boolean;
        store_id: string;
    } = {
        store_id: store_id as string,
    };
    if (app) {
        select = 'name id chair';
        // path = '';
        // products = '';
        match.active = true;
    }
    const data = await Department.find(match, select)
        .sort('order')
        .populate({
            match,
            path: 'subDepartment',
            options: { sort: { order: 1 } },
            // populate: {
            //     path,
            //     populate: { path: products },
            // },
            select,
        });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
