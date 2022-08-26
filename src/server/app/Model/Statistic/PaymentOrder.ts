import mongoose, { Document } from 'mongoose';

interface IOrderPayment {
    _id: string;
}

const { Schema } = mongoose;

const OrderPayemntSchema = new Schema(
    {
        count: Number,
        total: Number,
        total_voucher: Number,
        group_id: String,
        store_id: String,
        id: String,
        time: Number,
        name: String,
    },
    { collection: 'stat_order_payment', versionKey: false, timestamps: true },
);

const PaymentOrder = mongoose.model<IOrderPayment & Document>('stat_order_payment', OrderPayemntSchema);
export default PaymentOrder;
