import mongoose, { Document } from 'mongoose';

interface IOrderCustomer {
    _id: string;
}

const { Schema } = mongoose;

const OrderCustomerSchema = new Schema(
    {
        count: Number,
        total: Number,
        total_voucher: Number,
        group_id: String,
        store_id: String,
        id: String,
        time: Number,
        customer_name: String,
        customer_avatar: String,
    },
    { collection: 'stat_customer_payment', versionKey: false, timestamps: true },
);

const CustomerOrder = mongoose.model<IOrderCustomer & Document>('stat_customer_payment', OrderCustomerSchema);
export default CustomerOrder;
