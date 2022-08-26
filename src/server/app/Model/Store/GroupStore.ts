import mongoose, { Document } from 'mongoose';
import { GroupStoreType } from '../../Types';

const { Schema } = mongoose;

const GroupStoresSchema = new Schema(
    {
        name: String,
        id: {
            type: String,
            unique: true,
        },
        desc: { type: String, default: '' },
        logo: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/icon-store.png' },
        active: { type: Boolean, default: true },
        receive_message_order: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        workspace_id: { type: String, unique: true },
        api_key: String,
        secret_key: String,
        partner_code: String,
        ip: String,
    },
    { collection: 'group_stores', versionKey: false, timestamps: true },
);

const GroupStores = mongoose.model<GroupStoreType & Document>('group_stores', GroupStoresSchema);
export default GroupStores;
