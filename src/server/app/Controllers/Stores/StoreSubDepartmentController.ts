import { Request, Response } from 'express';
import remove from 'lodash/remove';
import { Store, Order, Department, SubDepartment } from '@smodel/index';
import { randomString } from '@shelpers/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin } from '@sservice/index';

export const storesSubDepartmentCreate = catchAsync(async (req: Request, res: Response) => {
    const { department_id, store_id } = req.body;
    const department = await Department.findById(department_id);
    const store = await Store.findById(store_id);
    if (!department || !store) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin bàn',
        });
    }
    const subDepartment = await new SubDepartment({ ...req.body, id: `${store.id}-${randomString(6)}` }).save();
    department.subDepartment.push(subDepartment._id);
    await department.save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới bàn`,
        type: 'create',
        key: 'department',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: req.body.name,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const storesSubDepartmentUpdate = catchAsync(async (req: Request, res: Response) => {
    const { subDeparmentId } = req.params;
    const { group_id, store_id } = req.body;
    delete req.body.department_id;
    delete req.body.store_id;
    const data = await SubDepartment.findByIdAndUpdate(subDeparmentId, req.body);
    if (data) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `sửa bàn`,
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

export const storesSubDepartmentDelete = catchAsync(async (req: Request, res: Response) => {
    const { subDeparmentId } = req.params;
    const sub_deparment = await SubDepartment.findById(subDeparmentId);
    if (sub_deparment && sub_deparment.orders.length > 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Có đơn hàng chưa được xử lý tại bàn này',
        });
    }
    const data = await sub_deparment?.delete();
    if (data) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `xoá phòng`,
            type: 'delete',
            key: 'department',
            order_id: sub_deparment?.name as string,
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

export const storesSubDepartmentIndex = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    const data = await Department.find({ store_id: store_id as string }).populate({
        path: 'subDepartment',
        options: { sort: { order: 1 } },
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const ordersUpdateStatusDeparment = catchAsync(async (req: Request, res: Response) => {
    const { subDeparmentId } = req.params;
    const { department_id, type, group_id, store_id } = req.body;
    const sub_deparment = await SubDepartment.findById(subDeparmentId);
    if (sub_deparment && sub_deparment.department_id === department_id) {
        if (type === 'reset') {
            const order = await Order.findOne(
                {
                    group_id,
                    store_id,
                    department_id,
                    sub_department_id: sub_deparment._id,
                    status: { $in: ['pending', 'processing'] },
                },
                '_id',
            );
            if (order) {
                return res.status(400).json({
                    errorCode: 4000,
                    message: 'Có đơn hàng chưa được xử lý',
                });
            }
            sub_deparment.status = 'none';
            sub_deparment.orders = [];
        } else {
            sub_deparment.request = '';
        }
        await sub_deparment.save();
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(404).json({
        errorCode: 4040,
        message: 'Không có thông tin bàn',
    });
});

export const orderschangeSubDeparment = catchAsync(async (req: Request, res: Response) => {
    const { department_id, order_id, sub_department_id, group_id, store_id } = req.body;
    const orderEdit = await Order.findById(order_id);
    if (
        !orderEdit ||
        orderEdit.status_order === 'take-away' ||
        orderEdit.status === 'cancelled' ||
        orderEdit.status === 'completed' ||
        orderEdit.group_id !== group_id ||
        orderEdit.store_id !== store_id
    ) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin đơn hàng hoặc không phải đơn dùng tại bàn',
        });
    }
    const sub_deparment = await SubDepartment.findById(sub_department_id);
    if (!sub_deparment || sub_deparment.store_id !== store_id) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin bàn',
        });
    }
    const department = await Department.findById(department_id);
    if (!department || department.store_id !== store_id) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin phòng',
        });
    }
    if (sub_department_id !== orderEdit.sub_department_id) {
        const sub_deparment_remove = await SubDepartment.findById(orderEdit.sub_department_id, 'orders');
        if (sub_deparment_remove) {
            const storeArray = sub_deparment_remove.orders.map(String);
            remove(storeArray, (n) => {
                return n === orderEdit._id.toString();
            });
            if (storeArray.length === 0) {
                sub_deparment_remove.status = 'none';
                sub_deparment_remove.request = '';
            }
            sub_deparment_remove.orders = storeArray;
            await sub_deparment_remove.save();
        }
        sub_deparment.orders.push(orderEdit._id);
        sub_deparment.status = orderEdit.status_order;
        orderEdit.sub_department_id = sub_deparment._id;
        orderEdit.sub_department_name = sub_deparment.name;
        orderEdit.department_id = department._id;
        orderEdit.department_name = department.name;
        await sub_deparment.save();
        await orderEdit.save();
    }
    return res.status(200).json({
        errorCode: 0,
        message: `Đơn hàng này đã được đổi sang bàn ${sub_deparment.name} > ${department.name}`,
    });
});
