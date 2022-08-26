import mongoose, { Document } from 'mongoose';
import { WareHouseDailyLogType } from '../../Types';

const { Schema } = mongoose;

const WareHouseDailyLogSchema = new Schema(
    {
        group_id: { type: String },
        store_id: { type: String },
        warehouse_id: {
            type: Schema.Types.ObjectId,
            ref: 'ware_house',
        },
        time: { type: Number },
        name: { type: String },
        import_amount: { type: Number, default: 0 },
        export_amount: { type: Number, default: 0 },
        sell_amount: { type: Number, default: 0 },
        unit: { type: String },
        warehouse_type: { type: String },
        status: { type: String, default: 'consume' },
    },
    { collection: 'warehouse_daily_log', versionKey: false, timestamps: true },
);

const WareHouseDailyLog = mongoose.model<WareHouseDailyLogType & Document>(
    'warehouse_daily_log',
    WareHouseDailyLogSchema,
);
export default WareHouseDailyLog;
