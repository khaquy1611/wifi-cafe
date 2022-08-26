import { Request, Response } from 'express';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import {
    Order,
    StatOverviewOrder,
    StatPaymentOrder,
    StatProductOrder,
    StatStatusOrder,
    StatCustomerOrder,
    StatUserOrder,
    StatOverviewPayment,
} from '@smodel/index';
import { getDatesBetweenDates } from '@shelpers/index';
import catchAsync from '@sexceptions/CatchAsync';

interface QueryData {
    offset?: number;
    start?: number;
    end?: number;
    type?: string;
    id?: RegExp;
    time?: { $in: Array<number> };
}

export const statOrderToday = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, status } = req.query;
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: moment()
            .set({
                hour: 6,
                minute: 0,
                second: 0,
            })
            .unix(),
        ...(!isEmpty(status) ? { status } : {}),
    };
    const data = await Order.aggregate([
        {
            $match: body,
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    dayOfMonth: { $dayOfMonth: '$createdAt' },
                    hour: { $hour: '$createdAt' },
                },
                time: { $last: '$createdAt' },
                count: { $sum: 1 },
                total: { $sum: '$total' },
                total_voucher: { $sum: '$discount_amount' },
                name: { $last: '$store_name' },
            },
        },
        {
            $project: {
                _id: 0,
                time: 1,
                count: 1,
                total: 1,
                total_voucher: 1,
                name: 1,
            },
        },
        { $sort: { time: 1 } },
    ]);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderType = catchAsync(async (req: Request, res: Response) => {
    const { type, start, end, group_id, store_id } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
    };
    let model = StatStatusOrder;
    if (type === 'payment') {
        model = StatPaymentOrder;
    } else if (type === 'customer') {
        model = StatCustomerOrder;
    }
    const data = await model.find(body, 'id name count total total_voucher time customer_name');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderCustomer = catchAsync(async (req: Request, res: Response) => {
    const { start, end, group_id, store_id } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
    };
    const data = await StatCustomerOrder.aggregate([
        {
            $match: body,
        },
        {
            $group: {
                _id: '$id',
                count: { $sum: '$count' },
                total: { $sum: '$total' },
                total_voucher: { $sum: '$total_voucher' },
                customer_name: { $last: '$customer_name' },
                customer_avatar: { $last: '$customer_avatar' },
            },
        },
        {
            $project: {
                _id: 0,
                id: '$_id',
                count: 1,
                total: 1,
                total_voucher: 1,
                customer_name: 1,
                customer_avatar: 1,
            },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
    ]);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderUser = catchAsync(async (req: Request, res: Response) => {
    const { start, end, group_id, store_id } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
    };
    const data = await StatUserOrder.aggregate([
        {
            $match: body,
        },
        {
            $group: {
                _id: '$id',
                count: { $sum: '$count' },
                total: { $sum: '$total' },
                total_voucher: { $sum: '$total_voucher' },
                user_name: { $last: '$user_name' },
                user_avatar: { $last: '$user_avatar' },
            },
        },
        {
            $project: {
                _id: 0,
                id: '$_id',
                count: 1,
                total: 1,
                total_voucher: 1,
                user_name: 1,
                user_avatar: 1,
            },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
    ]);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderProduct = catchAsync(async (req: Request, res: Response) => {
    const { start, end, group_id, store_id } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
    };
    const data = await StatProductOrder.aggregate([
        {
            $match: body,
        },
        {
            $group: {
                _id: '$id',
                count: { $sum: '$count' },
                total: { $sum: '$total' },
                name: { $last: '$name' },
                logo: { $last: '$logo' },
            },
        },
        {
            $project: {
                _id: 0,
                id: '$_id',
                count: 1,
                total: 1,
                name: 1,
                logo: 1,
            },
        },
        { $sort: { total: -1 } },
    ]);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderOverview = catchAsync(async (req: Request, res: Response) => {
    const { start, end, group_id, store_id, type } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    let model = StatOverviewOrder;
    if (type === 'payment') {
        model = StatOverviewPayment;
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
    };
    const data = await model.find(body, 'id count total total_voucher time name').sort('time');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const statOrderUserOverview = catchAsync(async (req: Request, res: Response) => {
    const { start, end, group_id, store_id, user_id } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const dates = getDatesBetweenDates(Number(start), Number(end));
    if (dates.length === 0) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        });
    }
    const body = {
        group_id,
        ...(!isEmpty(store_id) ? { store_id } : {}),
        time: { $in: dates },
        id: user_id,
    };
    const data = await StatUserOrder.find(body, 'id count total_voucher total time').sort('time');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const ordersIndexCMS = catchAsync(async (req: Request, res: Response) => {
    const { offset, start, end, id, type } = req.query;
    if (Number(start) > Number(end)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Ngày kết thúc cần lớn hơn ngày bắt đầu',
        });
    }
    const skip: number = offset ? parseInt(offset as string, 10) : 0;
    const body: QueryData = req.query;
    let limit = 10;
    if (type === 'export') {
        limit = 5000;
        // if (!start || !end || moment.unix(Number(end)).diff(moment.unix(Number(start)), 'days') > 31) {
        //     return res.status(400).json({
        //         errorCode: 4000,
        //         message: 'Xuất báo cáo vui lòng chọn khoảng thời gian trong vòng một tháng',
        //     });
        // }
    }
    if (start && end) {
        const dates = getDatesBetweenDates(Number(start), Number(end));
        // if (dates.length === 0) {
        //     return res.status(400).json({
        //         errorCode: 4000,
        //         message: 'Vui lòng chọn khoảng thời gian trong vòng 3 tháng',
        //     });
        // }
        body.time = { $in: dates };
    }
    if (id) {
        body.id = new RegExp(`${id}`);
    }
    delete body.offset;
    delete body.start;
    delete body.end;
    delete body.type;
    const data = await Order.find(body, {}, { skip, limit }).sort('-createdAt');
    const countQuery = await Order.countDocuments(body);
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});
