import express from 'express';
import { validate } from 'express-validation';
import { StoreController } from '@scontroller/index';
import { StoreValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post('/create', validate(StoreValidate.storesCreateValidation, {}, {}), roleCMS, StoreController.storesCreate);
router.put('/:storeId', validate(StoreValidate.storesCreateValidation, {}, {}), roleCMS, StoreController.storesUpdate);
router.get('', validate(StoreValidate.storesIndexValidation, {}, {}), StoreController.storesIndex);

export default router;
