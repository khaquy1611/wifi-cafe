import mongoose, { Document } from 'mongoose';

interface IOrderUser {
    _id: string;
}

const { Schema } = mongoose;

const OrderUserSchema = new Schema(
    {
        count: Number,
        total: Number,
        total_voucher: Number,
        group_id: String,
        store_id: String,
        id: String,
        time: Number,
        user_name: String,
        user_avatar: String,
    },
    { collection: 'stat_user_payment', versionKey: false, timestamps: true },
);

const UserOrder = mongoose.model<IOrderUser & Document>('stat_user_payment', OrderUserSchema);
export default UserOrder;
