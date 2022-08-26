/* eslint-disable no-plusplus */
import { map } from 'lodash';
import moment from 'moment';
import { Coupon, CouponCustomer, Order } from '@smodel/index';
import { CouponCheckStatus } from '@stypes/index';
import ErrorHandler from '@sexceptions/index';

export const checkStatusCoupon = async ({
    group_id,
    store_id,
    code,
    total,
    list_products,
    order_id = '',
    customer_id = '',
    platform,
}: CouponCheckStatus) => {
    try {
        const coupon = await Coupon.findOne({
            group_id,
            store_id,
            code,
            active: true,
            ...(platform ? { platform } : null),
        });
        if (!coupon) {
            throw new Error('Mã khuyến mãi không hợp lệ');
        }
        if (!order_id) {
            const dateNow = moment().unix();
            const hmNow = Number(`${moment().format('HHmm')}`);
            const cStart = Number(`${moment.unix(coupon.date_start).format('HHmm')}`);
            const cEnd = Number(`${moment.unix(coupon.date_expires).format('HHmm')}`);
            if (dateNow < coupon.date_start || dateNow > coupon.date_expires || hmNow < cStart || hmNow > cEnd) {
                throw new Error('Mã khuyến mãi này đã hết hạn hoặc chưa đến giờ áp dụng');
            }
            if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
                throw new Error('Mã khuyến mãi đã được dùng hết');
            }
        }
        if (!order_id && coupon.usage_limit_per_user && customer_id && customer_id !== '0') {
            const customer_coupon = await CouponCustomer.findOne({
                customer_id,
                coupon_id: coupon._id,
            });
            if (customer_coupon) {
                if (customer_coupon.usage_count >= coupon.usage_limit_per_user) {
                    throw new Error('Bạn đã hết số lần dùng mã khuyến mãi này');
                }
                if (coupon.limit_by_day && customer_coupon.usage_count_by_day >= coupon.limit_by_day) {
                    throw new Error('Bạn đã dùng hết số lần mã khuyến mãi trong ngày hôm nay');
                }
            }
        }
        if (coupon.minimum_amount && coupon.minimum_amount > total) {
            throw new Error(
                `Mã này chỉ áp dụng cho đơn hàng tối thiểu ${coupon.minimum_amount.toLocaleString('en-AU')} ₫`,
            );
        }
        if (coupon.maximum_amount && coupon.maximum_amount < total) {
            throw new Error(
                `Mã này chỉ áp dụng cho đơn hàng tối đa ${coupon.maximum_amount.toLocaleString('en-AU')} ₫`,
            );
        }
        let discount_amount = 0;
        if (coupon.discount_type === 'fixed_cart') {
            discount_amount = coupon.amount;
        } else if (coupon.discount_type === 'percent_cart') {
            discount_amount = total * (coupon.amount / 100);
        } else {
            const listProducts = map(list_products, 'product_id');
            let c = false;
            listProducts.forEach((item: string) => {
                if (coupon.product_ids.includes(item)) {
                    c = true;
                }
            });
            if (!c) {
                throw new Error('Mã khuyến mãi không áp dụng cho đơn hàng này');
            }
            if (coupon.discount_type === 'fixed_product') {
                discount_amount = coupon.amount;
            } else {
                discount_amount = total * (coupon.amount / 100);
            }
        }
        return {
            errorCode: 0,
            message: 'success',
            data: {
                discount_type: coupon.discount_type,
                discount_id: coupon._id,
                discount_name: coupon.name,
                discount_amount,
                discount_code: coupon.code,
            },
        };
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message, name: 'CouponCode' });
    }
};

export const saveStatusCoupon = async ({
    coupon_id,
    customer_id = '',
}: {
    coupon_id: string;
    customer_id?: string;
}) => {
    try {
        const coupon = await Coupon.findById(coupon_id);
        if (coupon) {
            if (customer_id && customer_id !== '0' && coupon.usage_limit_per_user) {
                const customer_coupon = await CouponCustomer.findOne({
                    customer_id,
                    coupon_id,
                });
                if (customer_coupon) {
                    customer_coupon.usage_count++;
                    customer_coupon.usage_count_by_day++;
                    await customer_coupon.save();
                } else {
                    await new CouponCustomer({
                        customer_id,
                        coupon_id,
                        usage_count: 1,
                        usage_count_by_day: 1,
                    }).save();
                }
            }
            coupon.usage_count++;
            await coupon.save();
        }
        return {
            errorCode: 0,
            message: 'success',
        };
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const cancelCoupon = async ({ order_id }: { order_id: string }) => {
    try {
        const orderEdit = await Order.findById(order_id);
        if (
            !orderEdit ||
            orderEdit.status === 'completed' ||
            orderEdit.status === 'cancelled' ||
            orderEdit.status_payment === 'completed'
        ) {
            throw new Error('Không tìm thấy đơn hàng hoặc đơn này đã được xử lý hoặc đã thanh toán');
        }
        if (orderEdit.discount_code) {
            const coupon = await Coupon.findById(orderEdit.discount_id);
            if (!coupon) {
                throw new Error('Không tìm thấy mã khuyến mãi này');
            }
            if (orderEdit.customer_id !== '0') {
                const customer_coupon = await CouponCustomer.findOne({
                    customer_id: orderEdit.customer_id,
                    coupon_id: orderEdit.discount_id,
                });
                if (customer_coupon && customer_coupon.usage_count > 0) {
                    customer_coupon.usage_count--;
                    if (customer_coupon.usage_count_by_day > 0) {
                        customer_coupon.usage_count_by_day--;
                    }
                    await customer_coupon.save();
                }
            }
            if (coupon.usage_count > 0) {
                coupon.usage_count--;
                await coupon.save();
            }
            orderEdit.discount_code = '';
            orderEdit.discount_id = '';
            orderEdit.discount_name = '';
            orderEdit.discount_amount = 0;
            await orderEdit.save();
        }
        return {
            errorCode: 0,
            message: 'success',
        };
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};
