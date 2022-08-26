import mongoose, { Document } from 'mongoose';
import { CustomerType } from '../../Types';

const { Schema } = mongoose;

const CustomerSchema = new Schema(
    {
        id: String,
        staff_id: String,
        staff_id_code: String,
        is_hrm: Boolean,
        staff_code: String,
        workspace_id: String,
        group_id: String,
        name: String,
        avatar: { type: String, default: 'https://s3.kstorage.vn/qrpayment/common/avatardefault.png' },
        birthday: String,
        gender: String,
        is_owner: Boolean,
        is_leader: Boolean,
        email: String,
        phone_number: String,
        company: {},
        department: {},
        sub_department: {},
        team: {},
        office: {},
        token: String,
    },
    { collection: 'customer', versionKey: false, timestamps: true },
);

const Customer = mongoose.model<CustomerType & Document>('customer', CustomerSchema);
export default Customer;
