import mongoose, { Document } from 'mongoose';
import { OrderProductType } from '../../Types';

const { Schema } = mongoose;

const OrderProductSchema = new Schema(
    {
        order_id: String,
        product_id: String,
        name: String,
        logo: String,
        price: Number,
        quantity: Number,
        group_id: String,
        store_id: String,
        note: String,
        time: Number,
        number_recieve: { type: Number, default: 0 },
        status: { type: String, default: 'pending' },
    },
    { collection: 'order_product', versionKey: false, timestamps: true },
);

const OrderProduct = mongoose.model<OrderProductType & Document>('order_product', OrderProductSchema);
export default OrderProduct;
