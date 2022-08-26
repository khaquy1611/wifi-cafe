import express from 'express';
import { validate } from 'express-validation';
import { ReceiptTypeController } from '@scontroller/index';
import { ReceiptTypeValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post('', validate(ReceiptTypeValidate.create, {}, {}), roleCMS, ReceiptTypeController.create);
router.get('', validate(ReceiptTypeValidate.list, {}, {}), roleCMS, ReceiptTypeController.list);

export default router;
