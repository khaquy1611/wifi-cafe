import mongoose, { Document } from 'mongoose';

import { StoreType } from '../../Types';

const { Schema } = mongoose;

const StoresSchema = new Schema(
    {
        id: { type: String, unique: true },
        name: String,
        desc: { type: String, default: '' },
        logo: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/icon-store.png' },
        phone_number: { type: String, default: '' },
        address: { type: String, default: '' },
        lat: Number,
        long: Number,
        active: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        group_id: String,
        ips: [String],
        message: String,
        orderId: { type: Number, default: 0 },
        order_code: { type: Number, default: 0 },
        order_card_table: { type: Number, default: 30 },
        receive_message_order: { type: Boolean, default: true },
        api_key: String,
        secret_key: String,
        partner_code: String,
        ip: String,
        messenger: String,
        zalo: String,
        receipt_no: { type: Number, default: 0 },
        location: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    { collection: 'stores', versionKey: false, timestamps: true },
);

const Stores = mongoose.model<StoreType & Document>('stores', StoresSchema);
export default Stores;
