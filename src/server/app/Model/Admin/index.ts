import mongoose, { Document } from 'mongoose';
import { AdminType } from '../../Types';

const { Schema } = mongoose;

const AdminSchema = new Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: 'ADMIN' },
        active: { type: Boolean, default: true },
        login_multi_device: { type: Boolean, default: true },
        avatar: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/avatardefault.png' },
        permissions: [String],
        role_permissions: [String],
        loginAt: Number,
        token: String,
        two_factor: { type: Boolean, default: false },
        secret_pin: String,
        secret_url: String,
        workspace_id: String,
        is_owner: Boolean,
        token_mini_app: String,
        deviceToken: String,
        platform: String,
        receive_message_order: { type: Boolean, default: true },
        stores: [
            {
                type: Schema.Types.ObjectId,
                ref: 'stores',
            },
        ],
        groupStores: [
            {
                type: Schema.Types.ObjectId,
                ref: 'group_stores',
            },
        ],
    },
    { collection: 'admin', versionKey: false, timestamps: true },
);

const Admin = mongoose.model<AdminType & Document>('admin', AdminSchema);
export default Admin;
