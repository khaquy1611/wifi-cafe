import express from 'express';
import { validate } from 'express-validation';
import { UploadValidate } from '@svalidator/index';
import { FileController } from '@scontroller/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.delete('/:fileId', validate(UploadValidate.fileDeleteValidation, {}, {}), roleCMS, FileController.deleteFile);
router
    .route('')
    .get(validate(UploadValidate.fileUploadValidation, {}, {}), roleCMS, FileController.getFile)
    .post(validate(UploadValidate.fileUploadValidation, {}, {}), roleCMS, FileController.uploadFile);

export default router;
