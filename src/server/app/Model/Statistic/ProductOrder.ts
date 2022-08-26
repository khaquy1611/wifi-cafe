import mongoose, { Document } from 'mongoose';

interface IOrderProduct {
    _id: string;
}

const { Schema } = mongoose;

const OrderOverviewSchema = new Schema(
    {
        count: Number,
        total: Number,
        group_id: String,
        store_id: String,
        id: String,
        name: String,
        logo: String,
        time: Number,
    },
    { collection: 'stat_order_product', versionKey: false, timestamps: true },
);

const ProductOrder = mongoose.model<IOrderProduct & Document>('stat_order_product', OrderOverviewSchema);
export default ProductOrder;
