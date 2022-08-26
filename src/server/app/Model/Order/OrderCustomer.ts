import mongoose, { Document } from 'mongoose';

interface IOrderCustomer {
    _id: string;
    order_id: string;
    status: string;
}

const { Schema } = mongoose;

const OrderCustomerSchema = new Schema(
    {
        order_id: String,
        customer_id: String,
        orderId: String,
        total: Number,
        number: Number,
        group_id: String,
        store_id: String,
        status: { type: String, default: 'pending' },
    },
    { collection: 'order_customer', versionKey: false, timestamps: true },
);

const OrderCustomer = mongoose.model<IOrderCustomer & Document>('order_customer', OrderCustomerSchema);
export default OrderCustomer;
