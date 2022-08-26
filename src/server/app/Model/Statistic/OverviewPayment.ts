import mongoose, { Document } from 'mongoose';

interface IOrderOverviewPayment {
    _id: string;
}

const { Schema } = mongoose;

const OrderOverviewPaymentSchema = new Schema(
    {
        count: Number,
        total: Number,
        total_voucher: Number,
        group_id: String,
        store_id: String,
        id: String,
        time: Number,
    },
    { collection: 'stat_order_overview_payment', versionKey: false, timestamps: true },
);

const OverviewOrderPayment = mongoose.model<IOrderOverviewPayment & Document>(
    'stat_order_overview_payment',
    OrderOverviewPaymentSchema,
);
export default OverviewOrderPayment;
