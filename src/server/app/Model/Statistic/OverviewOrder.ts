import mongoose, { Document } from 'mongoose';

interface IOrderOverview {
    _id: string;
}

const { Schema } = mongoose;

const OrderOverviewSchema = new Schema(
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
    { collection: 'stat_order_overview', versionKey: false, timestamps: true },
);

const OverviewOrder = mongoose.model<IOrderOverview & Document>('stat_order_overview', OrderOverviewSchema);
export default OverviewOrder;
