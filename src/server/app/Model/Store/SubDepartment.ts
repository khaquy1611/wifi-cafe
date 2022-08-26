import mongoose, { Document } from 'mongoose';
import { StoreSubDepartmentType } from '../../Types';

const { Schema } = mongoose;

const StoresSubDepartmentSchema = new Schema(
    {
        id: { type: String, unique: true },
        name: String,
        desc: String,
        active: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        status: { type: String, default: 'none' },
        request: String,
        chair: Number,
        department_id: String,
        store_id: String,
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: 'orders',
            },
        ],
    },
    { collection: 'stores_sub_department', versionKey: false, timestamps: true },
);

const StoresSubDepartment = mongoose.model<StoreSubDepartmentType & Document>(
    'stores_sub_department',
    StoresSubDepartmentSchema,
);
export default StoresSubDepartment;
