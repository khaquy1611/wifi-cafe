import mongoose, { Document } from 'mongoose';

interface ICookieOrder {
    _id: string;
    agent: string;
}

const { Schema } = mongoose;

const CookieOrderSchema = new Schema(
    {
        id: String,
        agent: String,
    },
    { collection: 'cookie_order', versionKey: false, timestamps: true },
);

const CookieOrder = mongoose.model<ICookieOrder & Document>('cookie_order', CookieOrderSchema);
export default CookieOrder;
