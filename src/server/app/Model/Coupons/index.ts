import mongoose, { Document } from 'mongoose';
import { CouponType } from '../../Types';

const { Schema } = mongoose;

const CouponsSchema = new Schema(
    {
        group_id: String,
        store_id: String,
        code: String,
        amount: Number,
        discount_type: String,
        name: String,
        date_start: Number,
        date_expires: Number,
        time_start: Number,
        time_expires: Number,
        limit_by_day: { type: Number, default: 0 },
        usage_count: { type: Number, default: 0 },
        product_ids: { type: [String], default: [] },
        usage_limit: { type: Number, default: 0 },
        usage_limit_per_user: { type: Number, default: 0 },
        minimum_amount: { type: Number, default: 0 },
        maximum_amount: { type: Number, default: 1000000000 },
        used_by: [String],
        active: { type: Boolean, default: true },
        show_user: { type: Boolean, default: true },
        platform: [String],
    },
    { collection: 'coupons', versionKey: false, timestamps: true },
);

const Coupons = mongoose.model<CouponType & Document>('coupons', CouponsSchema);
export default Coupons;
