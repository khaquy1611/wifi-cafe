import express from 'express';
import { validate } from 'express-validation';
import { WareHouseController } from '@scontroller/index';
import { WareHouseValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post('', validate(WareHouseValidate.create, {}, {}), roleCMS, WareHouseController.wareHouseCreate);
router.get('', validate(WareHouseValidate.list, {}, {}), roleCMS, WareHouseController.wareHouseIndex);
router.get('/export', validate(WareHouseValidate.list, {}, {}), roleCMS, WareHouseController.exportListWarehouse);
router.post('/import', validate(WareHouseValidate.importList, {}, {}), roleCMS, WareHouseController.wareHouseImport);
router.put('/:id', validate(WareHouseValidate.update, {}, {}), roleCMS, WareHouseController.wareHouseUpdate);
router.delete('/:id', validate(WareHouseValidate.update, {}, {}), roleCMS, WareHouseController.wareHouseDelete);
router.get('/history', validate(WareHouseValidate.history), roleCMS, WareHouseController.wareHouseHistory);
export default router;
