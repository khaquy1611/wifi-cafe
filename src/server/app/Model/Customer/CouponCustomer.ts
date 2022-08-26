import mongoose, { Document } from 'mongoose';
import { CouponCustomerType } from '../../Types';

const { Schema } = mongoose;

const CustomerCouponSchema = new Schema(
    {
        customer_id: String,
        coupon_id: String,
        usage_count: { type: Number, default: 0 },
        usage_count_by_day: { type: Number, default: 0 },
    },
    { collection: 'coupon_customer', versionKey: false, timestamps: true },
);

const CustomerCoupon = mongoose.model<CouponCustomerType & Document>('coupon_customer', CustomerCouponSchema);
export default CustomerCoupon;
