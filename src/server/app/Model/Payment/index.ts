import mongoose, { Document } from 'mongoose';

interface IPayment {
    _id: string;
    name: string;
}

const { Schema } = mongoose;

const PaymentSchema = new Schema(
    {
        group_id: String,
        store_id: String,
        code: String,
        desc: String,
        name: String,
        key: { type: String, default: 'payment' },
        order: { type: Number, default: 1 },
        active: { type: Boolean, default: false },
        accountType: String,
        accountNo: String,
        bankCode: String,
        accountName: String,
        customerPhoneNumber: String,
    },
    { collection: 'payment_method', versionKey: false, timestamps: true },
);

const Payment = mongoose.model<IPayment & Document>('payment_method', PaymentSchema);
export default Payment;
