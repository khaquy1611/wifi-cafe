import mongoose, { Document } from 'mongoose';

interface IConfig {
    _id: string;
}

const { Schema } = mongoose;

const ConfigSchema = new Schema(
    {
        name: String,
        key: String,
        values: [String],
    },
    { collection: 'config_app', versionKey: false, timestamps: true },
);

const ConfigApp = mongoose.model<IConfig & Document>('config_app', ConfigSchema);
export default ConfigApp;
