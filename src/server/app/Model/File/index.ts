import mongoose, { Document } from 'mongoose';
import { FileType } from '../../Types';

const { Schema } = mongoose;

const FileSchema = new Schema(
    {
        name: String,
        type: String,
        location: String,
        size: Number,
        group_id: String,
        store_id: String,
        bucket: String,
        key: String,
        type_upload: String,
    },
    { collection: 'files_manager', versionKey: false, timestamps: true },
);

const FilesManager = mongoose.model<FileType & Document>('files_manager', FileSchema);
export default FilesManager;
