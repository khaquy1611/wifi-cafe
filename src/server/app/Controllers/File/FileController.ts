import { Response, Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '@svendor/AWS';
import logger from '@svendor/Logger';
import sendTelegram from '@svendor/Telegram';
import catchAsync from '@sexceptions/CatchAsync';
import { FileManager, GroupStore } from '@smodel/index';
import { saveLogAdmin } from '@sservice/index';

const listContentType = ['image/png', 'image/jpeg', 'image/gif'];
const listReceiptContentType = ['image/png', 'image/jpeg', 'application/pdf'];

export const uploadFile = async (req: any, res: Response) => {
    const admin = req.body.cmsAdminUser;
    const { group_id, store_id, type_upload } = req.query;
    const group = await GroupStore.findById(group_id, 'id');
    if (!group) {
        res.status(415).json({ errorCode: 4150, message: 'Cửa hàng không tồn tại' });
        return;
    }
    const listType = type_upload === 'receipt' ? listReceiptContentType : listContentType;
    const bucket = process.env.AWS_BUCKET as string;
    const upload = multer({
        limits: { files: 1, fileSize: 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (listType.includes(file.mimetype)) {
                cb(null, true);
                return;
            }
            cb(new Error('Định dạng file không hợp lệ'));
        },
        storage: multerS3({
            s3,
            bucket: `${bucket}/${group.id}`,
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
        }),
    }).single('file');
    upload(req, res, async (err: any) => {
        try {
            if (err) {
                logger.error(
                    `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(req.body)} - Message: ${
                        err.message
                    } - Stack: ${err.stack}`,
                );
                if (process.env.APP_DEBUG === 'development') {
                    return res.status(415).json({ errorCode: 4150, message: err.message });
                }
                return res.status(415).json({ errorCode: 4150, message: 'Upload không thành công' });
            }
            const { originalname, contentType, size, location, key, bucket } = req.file;
            if (!listType.includes(contentType)) {
                const params = {
                    Bucket: bucket,
                    Key: key,
                };
                await s3.deleteObject(params, (errs) => {
                    if (errs) {
                        logger.error(
                            `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(
                                req.body,
                            )} - Message: ${errs.message} - Stack: ${errs.stack}`,
                        );
                    }
                });
                logger.error(
                    `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(
                        req.body,
                    )} - Message: ${contentType} could not in ${listType}`,
                );
                return res.status(415).json({ errorCode: 4150, message: ' File không hợp lệ' });
            }
            const file = await new FileManager({
                name: originalname,
                type: contentType,
                location,
                size,
                group_id,
                store_id,
                key,
                bucket,
                type_upload,
            }).save();
            await saveLogAdmin({
                name: `upload hình ảnh`,
                type: 'upload_file',
                key: 'image',
                user_id: admin._id,
                user_name: admin.name,
                user_email: admin.email,
                group_id,
                store_id,
                order_id: originalname,
            });
            sendTelegram({
                type: 'photo',
                message: location,
                captionPhoto: `${admin.email} upload file ${originalname}`,
            });
            return res.status(200).json({
                errorCode: 0,
                message: 'success',
                data: file.location,
            });
        } catch (error) {
            logger.error(
                `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(req.body)} - Message: ${
                    error.message
                } - Stack: ${error.stack}`,
            );
            if (process.env.APP_DEBUG === 'development') {
                return res.status(415).json({ errorCode: 4150, message: error.message });
            }
            return res.status(415).json({ errorCode: 4150, message: 'Upload ảnh không thành công' });
        }
    });
};

export const deleteFile = catchAsync(async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const { group_id, store_id } = req.body;
    const image = await FileManager.findByIdAndDelete(fileId);
    if (image) {
        await s3.deleteObject({ Bucket: image.bucket, Key: image.key }, (errs) => {
            if (errs) {
                logger.error(
                    `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(req.body)} - Message: ${
                        errs.message
                    } - Stack: ${errs.stack}`,
                );
            }
        });
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `xoá hình ảnh`,
            type: 'delete_file',
            key: 'image',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: image.name,
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const getFile = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, offset } = req.query;
    const skip: number = offset ? Number(offset) : 0;
    const data = await FileManager.find(
        { group_id: group_id as string, store_id, type_upload: null },
        '-updatedAt -bucket -key -group_id',
        {
            skip,
            limit: 10,
        },
    ).sort('-createdAt');
    const countQuery = await FileManager.countDocuments({ group_id: group_id as string, store_id });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total: countQuery,
    });
});
