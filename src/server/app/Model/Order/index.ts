import mongoose, { Document } from 'mongoose';
import { OrderType } from '../../Types';

const { Schema } = mongoose;

const OrdersSchema = new Schema(
    {
        workspace_id: String,
        group_id: String,
        store_id: String,
        store_name: String,
        department_id: String,
        department_name: String,
        sub_department_id: String,
        sub_department_name: String,
        id: String,
        orderId: String,
        transaction_id: String,
        name: String,
        number: Number,
        status: { type: String, default: 'pending' },
        status_payment: { type: String, default: 'pending' },
        status_service: { type: String, default: 'pending' },
        status_order: { type: String, default: 'at-place' },
        status_order_name: { type: String, default: 'Ăn tại bàn' },
        payment_method: String,
        payment_method_name: String,
        bank_code: String,
        currency: { type: String, default: 'VND' },
        total: Number,
        customer_id: { type: String, default: '0' },
        customer_name: { type: String, default: 'Khách lẻ' },
        customer_avatar: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/avatardefault.png' },
        staff_id: String,
        customer_phone_number: String,
        customer_ip_address: String,
        customer_user_agent: String,
        customer_note: String,
        note: String,
        user_id: String,
        user_name: String,
        user_avatar: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/avatardefault.png' },
        list_products: [{}],
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'order_product',
            },
        ],
        date_payment: Number,
        time: Number,
        store: {
            name: String,
            address: String,
            message: String,
            phone_number: String,
        },
        discount_code: String,
        discount_id: String,
        discount_name: String,
        discount_amount: { type: Number, default: 0 },
        payment_url: String,
        order_code: { type: Number, default: 0 },
        order_closing: String,
        order_closing_note: String,
        deviceToken: String,
        platform: String,
    },
    { collection: 'orders', versionKey: false, timestamps: true },
);

const Orders = mongoose.model<OrderType & Document>('orders', OrdersSchema);
export default Orders;
