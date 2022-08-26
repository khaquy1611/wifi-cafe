import mongoose, { Document } from 'mongoose';

interface INotifyMessage {
    _id: string;
}

const { Schema } = mongoose;

const NotifySchema = new Schema(
    {
        message: String,
        icon: String,
        store_id: String,
        orderId: String,
        order_id: String,
        unread: { type: Boolean, default: true },
    },
    { collection: 'notify', versionKey: false, timestamps: true },
);

const Notify = mongoose.model<INotifyMessage & Document>('notify', NotifySchema);
export default Notify;
