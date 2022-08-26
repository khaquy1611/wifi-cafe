import mongoose, { Document } from 'mongoose';
import { ProductAttributeType } from '@stypes/index';

const { Schema } = mongoose;

const ProductAttributeSchema = new Schema(
    {
        product_id: { type: Schema.Types.ObjectId, ref: 'products' },
        warehouse_id: { type: Schema.Types.ObjectId, ref: 'ware_house' },
        quantity: String,
    },
    { collection: 'product_attribute', versionKey: false, timestamps: true },
);

const ProductAttribute = mongoose.model<ProductAttributeType & Document>('product_attribute', ProductAttributeSchema);

export default ProductAttribute;
