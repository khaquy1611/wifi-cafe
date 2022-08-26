import express from 'express';
import { WareHouseReportController } from '@scontroller/index';
import { validate } from 'express-validation';
import roleCMS from '@smiddleware/roleCMS';
import { WareHouseReportValidate } from '@svalidator/index';

const router = express.Router();

router.get('/ware-house', validate(WareHouseReportValidate.list, {}, {}), roleCMS, WareHouseReportController.list);
router.get(
    '/ware-house/export',
    validate(WareHouseReportValidate.list, {}, {}),
    roleCMS,
    WareHouseReportController.exportsCSV,
);

export default router;
