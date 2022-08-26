import express from 'express';
import { validate } from 'express-validation';
import { NotifyValidate } from '@svalidator/index';
import { NotifyController, CommonController } from '@scontroller/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post('/sample/data', roleCMS, CommonController.sampleData);

router.get('/error', roleCMS, CommonController.getLog);
router.delete('/delete/error', roleCMS, CommonController.deleteLog);

router.get(
    '/notify',
    validate(NotifyValidate.logActionValidation, {}, {}),
    roleCMS,
    NotifyController.notifyMessageIndex,
);
router.post(
    '/notify/read',
    validate(NotifyValidate.readLogValidation, {}, {}),
    roleCMS,
    NotifyController.notifyMessageRead,
);

router.get('/action', validate(NotifyValidate.logActionValidation, {}, {}), roleCMS, NotifyController.logActionIndex);

export default router;
