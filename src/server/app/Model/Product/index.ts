import mongoose, { Document } from 'mongoose';
import { ProductType } from '../../Types';

const { Schema } = mongoose;

const ProductsSchema = new Schema(
    {
        id: String,
        name: String,
        desc: { type: String, default: '' },
        logo: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/default.png' },
        price: Number,
        status: { type: String, default: 'available' },
        tags: { type: [String], default: [] },
        group_id: String,
        store_id: String,
        type_warehouse: String,
        order: { type: Number, default: 1 },
        category_id: String,
    },
    { collection: 'products', versionKey: false, timestamps: true },
);

const Products = mongoose.model<ProductType & Document>('products', ProductsSchema);
export default Products;
