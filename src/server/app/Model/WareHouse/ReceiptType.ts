import mongoose, { Document } from 'mongoose';
import { ReceiptTypeType } from '../../Types';

const { Schema } = mongoose;

const ReceiptTypeSchema = new Schema(
    {
        group_id: String,
        store_id: String,
        name: String,
        type: String,
    },
    { collection: 'receipt_type', versionKey: false, timestamps: true },
);

const ReceiptType = mongoose.model<ReceiptTypeType & Document>('receipt_type', ReceiptTypeSchema);
export default ReceiptType;
