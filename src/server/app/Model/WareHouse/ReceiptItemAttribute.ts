import mongoose, { Document } from 'mongoose';
import { ReceiptItemAttribute } from '@stypes/index';

const { Schema } = mongoose;

const ReceiptItemAttributeSchema = new Schema(
    {
        receipt_id: { type: Schema.Types.ObjectId, ref: 'receipt' },
        warehouse_id: { type: Schema.Types.ObjectId, ref: 'ware_house' },
        quantity: { type: Number, default: 0 },
    },
    {
        versionKey: false,
        timestamps: true,
        collection: 'receipt_item_attribute',
    },
);

const ReceiptItemAttribute = mongoose.model<ReceiptItemAttribute & Document>(
    'receipt_item_attribute',
    ReceiptItemAttributeSchema,
);
export default ReceiptItemAttribute;
