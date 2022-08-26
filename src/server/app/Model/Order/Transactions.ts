import mongoose, { Document } from 'mongoose';
import { TransactionType } from '../../Types';

const { Schema } = mongoose;

const TransactionsSchema = new Schema(
    {
        message: String,
        group_id: String,
        store_id: String,
        amount: Number,
        error_code: Number,
        amount_bank: Number,
        order_id: String,
        orderId: { type: String, unique: true },
        bank_code: String,
        payment_method: String,
        currency: String,
        payment_type: String,
        appotapay_trans_id: String,
        transaction_ts: Number,
        extra_data: String,
        status: { type: String, default: 'pending' },
    },
    { collection: 'transactions', versionKey: false, timestamps: true },
);

const Transactions = mongoose.model<TransactionType & Document>('transactions', TransactionsSchema);
export default Transactions;
