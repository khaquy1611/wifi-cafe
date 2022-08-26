import { Request, Response } from 'express';
import { Customer, Order } from '@smodel/index';
import { HIDE_SELECT_ADMIN } from '@sconfig/app';
import catchAsync from '@sexceptions/CatchAsync';

export const listCustomer = catchAsync(async (req: Request, res: Response) => {
    const { group_id, offset, phone_number } = req.query;
    const skip: number = offset ? Number(offset) : 0;
    const body: {
        phone_number?: RegExp;
        group_id: string;
    } = {
        group_id: group_id as string,
    };
    if (phone_number) {
        body.phone_number = new RegExp(`${phone_number}`);
    }
    const data = await Customer.find(body, HIDE_SELECT_ADMIN, { skip, limit: 10 }).sort('-updatedAt');
    const countQuery = await Customer.countDocuments(body);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});

export const infoCustomer = catchAsync(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const data = await Customer.findById(customerId, HIDE_SELECT_ADMIN);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const historyOrderCustomer = catchAsync(async (req: Request, res: Response) => {
    const { offset, group_id, store_id } = req.query;
    const { customerId } = req.params;
    const skip: number = offset ? Number(offset) : 0;
    const customer = await Customer.findOne({ staff_id_code: customerId });
    const data = await Order.find(
        {
            customer_id: customer?._id,
            group_id: group_id as string,
            store_id: store_id as string,
            workspace_id: req.body.miniAppUser.workspace_id,
        },
        'id createdAt status total group_id store_id',
        {
            skip,
            limit: 10,
        },
    ).sort('-updatedAt');
    const countQuery = await Order.countDocuments({
        customer_id: customer?._id,
        group_id: group_id as string,
        store_id: store_id as string,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});

export const createCustomer = catchAsync(async (req: Request, res: Response) => {
    const { group_id, phone_number } = req.body;
    const customer = await Customer.findOne({ group_id, phone_number }, '_id');
    if (customer) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Đã có khách hàng với số điện thoại này',
        });
    }
    const data = await new Customer(req.body).save();
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const updateCustomer = catchAsync(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    delete req.body.group_id;
    await Customer.findByIdAndUpdate(customerId, req.body);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});
