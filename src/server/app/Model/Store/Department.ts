import mongoose, { Document } from 'mongoose';
import { StoreDepartmentType } from '../../Types';

const { Schema } = mongoose;

const StoresDepartmentSchema = new Schema(
    {
        name: String,
        desc: String,
        active: { type: Boolean, default: true },
        order: { type: Number, default: 1 },
        store_id: String,
        subDepartment: [
            {
                type: Schema.Types.ObjectId,
                ref: 'stores_sub_department',
            },
        ],
    },
    { collection: 'stores_department', versionKey: false, timestamps: true },
);

const StoresDepartment = mongoose.model<StoreDepartmentType & Document>('stores_department', StoresDepartmentSchema);
export default StoresDepartment;
