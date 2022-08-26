import mongoose, { Document } from 'mongoose';
import { ReceiptType } from '../../Types';

const { Schema } = mongoose;

const ReceiptSchema = new Schema(
    {
        group_id: String,
        store_id: String,
        type: String,
        receipt_type: String,
        code: String,
        name: String,
        file: String,
        desc: { type: String, default: '' },
        link_warehouse: [
            {
                warehouse_id: { type: Schema.Types.ObjectId, ref: 'ware_house' },
                quantity: Number,
            },
        ],
        list_operator: [
            {
                name: String,
                action: String,
                time: Number,
            },
        ],
        status: String,
    },
    { collection: 'receipt', versionKey: false, timestamps: true },
);

const Receipt = mongoose.model<ReceiptType & Document>('receipt', ReceiptSchema);
export default Receipt;
