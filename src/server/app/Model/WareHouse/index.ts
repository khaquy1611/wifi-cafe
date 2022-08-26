import mongoose, { Document } from 'mongoose';
import { WareHouseType } from '../../Types';

const { Schema } = mongoose;

const WareHouseSchema = new Schema(
    {
        group_id: { type: String },
        store_id: { type: String },
        product_id: { type: String },
        name: { type: String },
        amount: { type: Number },
        min_amount: { type: Number },
        type: { type: String },
        unit: { type: String },
        import_amount: { type: Number, default: 0 },
        export_amount: { type: Number, default: 0 },
        sell_amount: { type: Number, default: 0 },
    },
    { collection: 'ware_house', versionKey: false, timestamps: true },
);
const WareHouse = mongoose.model<WareHouseType & Document>('ware_house', WareHouseSchema);
export default WareHouse;
