import { Request, Response } from 'express';
import map from 'lodash/map';
import moment from 'moment';
import { verify } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import { Coupon } from '@smodel/index';
import { CouponType } from '@stypes/index';
import { randomString } from '@shelpers/index';
import catchAsync from '@sexceptions/CatchAsync';
import { checkStatusCoupon, cancelCoupon, saveLogAdmin } from '@sservice/index';

export const listCoupons = catchAsync(async (req: Request, res: Response) => {
    const { offset } = req.query;
    const skip: number = offset ? Number(offset) : 0;
    const body = req.query;
    delete body.offset;
    const data = await Coupon.find(body, '', { skip, limit: 10 });
    const countQuery = await Coupon.countDocuments(body);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});

export const listCouponsGuest = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, total, list_products, platform } = req.body;
    const { tokenqr } = parseCookies({ req });
    if (tokenqr) {
        verify(tokenqr, process.env.JWT_AUTHORIZATION as string);
    }
    const counpons = await Coupon.find(
        {
            group_id,
            store_id,
            date_start: { $lte: Math.floor(Date.now() / 1000) },
            date_expires: { $gte: Math.floor(Date.now() / 1000) },
            active: true,
            show_user: true,
            ...(!tokenqr ? { platform } : null),
        },
        'code amount name date_expires date_start discount_type maximum_amount minimum_amount product_ids usage_count usage_limit',
        { lean: true },
    );
    counpons.forEach((item: CouponType) => {
        if (item.discount_type === 'fixed_cart' || item.discount_type === 'percent_cart') {
            if (item.minimum_amount <= total && total <= item.maximum_amount) {
                item.available = true;
            }
        } else if (item.product_ids.length) {
            const listProducts = map(list_products, 'product_id');
            item.product_ids.forEach((i: string) => {
                if (listProducts.includes(i) && item.minimum_amount <= total && total <= item.maximum_amount) {
                    item.available = true;
                }
            });
        }
    });
    const dataVoucher = counpons.filter((coupon: CouponType) => {
        if (coupon.usage_limit) {
            return coupon.usage_count < coupon.usage_limit;
        }
        return coupon;
    });
    const hmNow = Number(`${moment().format('HHmm')}`);
    const dataCode = dataVoucher.filter((coupon: CouponType) => {
        const cStart = Number(`${moment.unix(coupon.date_start).format('HHmm')}`);
        const cEnd = Number(`${moment.unix(coupon.date_expires).format('HHmm')}`);
        return hmNow >= cStart && hmNow <= cEnd;
    });
    const data: any = [];
    dataCode.forEach((coupon: CouponType) => {
        data.push({
            _id: coupon.name,
            code: coupon.code,
            amount: coupon.amount,
            name: coupon.name,
            discount_type: coupon.discount_type,
            date_expires: coupon.date_expires,
            available: coupon.available,
        });
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, code, duplicate, number_duplicate } = req.body;
    const coupon = await Coupon.findOne({ group_id, store_id, code }, '_id');
    if (coupon) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Mã khuyến mãi này đã tồn tại',
        });
    }
    const dataExport = [] as CouponType[];
    let data = [] as CouponType[];
    if (duplicate && number_duplicate) {
        for (let i = 0; i < number_duplicate; i += 1) {
            dataExport.push({ ...req.body, show_user: false, code: randomString(6, true) });
        }
        data = await Coupon.insertMany(dataExport);
    } else {
        await new Coupon(req.body).save();
    }
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới mã khuyến mãi`,
        type: 'create',
        key: 'product',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id,
        store_id,
        order_id: req.body.name,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
    const { couponId } = req.params;
    const {
        name,
        amount,
        discount_type,
        product_ids,
        usage_limit,
        usage_limit_per_user,
        maximum_amount,
        minimum_amount,
        store_id,
        group_id,
        date_start,
        date_expires,
        limit_by_day,
    } = req.body;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy mã khuyến mãi này',
        });
    }
    if (coupon.date_expires < Math.floor(Date.now() / 1000)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không sửa được vì mã khuyến mãi này đã hết hạn sử dụng',
        });
    }
    if (coupon.date_start < Math.floor(Date.now() / 1000) && coupon.date_expires > Math.floor(Date.now() / 1000)) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không sửa được vì mã khuyến mãi này đang được áp dụng',
        });
    }
    coupon.name = name;
    coupon.amount = amount;
    coupon.discount_type = discount_type;
    coupon.date_start = date_start;
    coupon.date_expires = date_expires;
    if (limit_by_day) {
        coupon.limit_by_day = limit_by_day;
    }
    if (product_ids && product_ids.length) {
        coupon.product_ids = product_ids;
    }
    if (usage_limit) {
        coupon.usage_limit = usage_limit;
    }
    if (usage_limit_per_user) {
        coupon.usage_limit_per_user = usage_limit_per_user;
    }
    if (minimum_amount) {
        coupon.minimum_amount = minimum_amount;
    }
    if (maximum_amount) {
        coupon.maximum_amount = maximum_amount;
    }
    await coupon.save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `sửa mã khuyến mãi`,
        type: 'edit',
        key: 'product',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id,
        store_id,
        order_id: req.body.name,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const checkGuestCoupon = catchAsync(async (req: Request, res: Response) => {
    const { tokenqr } = parseCookies({ req });
    if (req.body.admin || req.body.order_id) {
        verify(tokenqr, process.env.JWT_AUTHORIZATION as string);
        delete req.body.platform;
    }
    const coupon = await checkStatusCoupon(req.body);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {
            discount_id: coupon.data?.discount_id,
            discount_name: coupon.data?.discount_name,
            discount_amount: coupon.data?.discount_amount,
            discount_code: coupon.data?.discount_code,
            discount_type: coupon.data?.discount_type,
        },
    });
});

export const cancelCouponOrder = catchAsync(async (req: Request, res: Response) => {
    const { order_id } = req.body;
    cancelCoupon({ order_id });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});
