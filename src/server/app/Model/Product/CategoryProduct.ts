import mongoose, { Document } from 'mongoose';

interface IGroupProduct {
    _id: string;
    name: string;
}

const { Schema } = mongoose;

const CategoryProductSchema = new Schema(
    {
        name: String,
        desc: String,
        group_id: String,
        store_id: String,
        logo: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/tea.png' },
        active: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
    },
    { collection: 'category_product', versionKey: false, timestamps: true },
);

const CategoryProduct = mongoose.model<IGroupProduct & Document>('category_product', CategoryProductSchema);
export default CategoryProduct;
