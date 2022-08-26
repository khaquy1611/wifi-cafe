import mongoose, { Document } from 'mongoose';

interface IOrderType {
    _id: string;
}

const { Schema } = mongoose;

const OrderTypeSchema = new Schema(
    {
        count: Number,
        total: Number,
        total_voucher: Number,
        group_id: String,
        store_id: String,
        id: String,
        name: String,
        time: Number,
    },
    { collection: 'stat_order_type', versionKey: false, timestamps: true },
);

const StatusOrder = mongoose.model<IOrderType & Document>('stat_order_type', OrderTypeSchema);
export default StatusOrder;
