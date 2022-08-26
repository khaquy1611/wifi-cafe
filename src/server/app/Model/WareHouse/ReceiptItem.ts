import mongoose, { Document } from 'mongoose';
import { ReceiptItemType } from '../../Types';

const { Schema } = mongoose;

const ReceiptItemSchema = new Schema(
    {
        group_id: { type: String },
        store_id: { type: String },
        warehouse_id: {
            type: Schema.Types.ObjectId,
            ref: 'ware_house',
        },
        receipt_id: { type: String, default: '' },
        orderId: { type: String, default: '' },
        name: { type: String },
        code: { type: String, default: '' },
        status: { type: String },
        import_amount: { type: Number, default: 0 },
        export_amount: { type: Number, default: 0 },
        sell_amount: { type: Number, default: 0 },
        unit: { type: String },
        warehouse_type: { type: String },
        note: { type: String },
        time: { type: Number },
        remain_amount: { type: Number, default: 0 },
    },
    {
        collection: 'receipt_item',
        versionKey: false,
        timestamps: true,
    },
);

const ReceiptItem = mongoose.model<ReceiptItemType & Document>('receipt_item', ReceiptItemSchema);

export default ReceiptItem;
