import mongoose, { Document } from 'mongoose';
import { LogActionAdminType } from '../../Types';

const { Schema } = mongoose;

const LogActionSchema = new Schema(
    {
        name: String,
        type: String,
        key: String,
        user_id: String,
        user_name: String,
        user_email: String,
        group_id: String,
        store_id: String,
        location: String,
        order_id: String,
    },
    { collection: 'log_action', versionKey: false, timestamps: true },
);

const LogAction = mongoose.model<LogActionAdminType & Document>('log_action', LogActionSchema);
export default LogAction;
