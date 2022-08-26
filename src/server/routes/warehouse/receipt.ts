import express from 'express';
import { validate } from 'express-validation';
import { ReceiptController } from '@scontroller/index';
import { ReceiptValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post('', validate(ReceiptValidate.create, {}, {}), roleCMS, ReceiptController.create);
router.get('', validate(ReceiptValidate.list, {}, {}), roleCMS, ReceiptController.list);
router.put(
    '/update-status/:id',
    validate(ReceiptValidate.updateStatus, {}, {}),
    roleCMS,
    ReceiptController.updateStatus,
);
router.get('/export-pdf/:id', validate(ReceiptValidate.detail, {}, {}), roleCMS, ReceiptController.exportPDF);
router.get('/:id', validate(ReceiptValidate.detail, {}, {}), roleCMS, ReceiptController.detail);
router.put('/:id', validate(ReceiptValidate.create, {}, {}), roleCMS, ReceiptController.update);
export default router;
