import express from 'express';
import { validate } from 'express-validation';
import { UserMiniAppController } from '@scontroller/index';
import { MiniappValidate } from '@svalidator/index';
import roleMiniApp from '@smiddleware/roleMiniApp';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post(
    '/push/notify/user',
    validate(MiniappValidate.pushNotifyValidation, {}, {}),
    roleCMS,
    UserMiniAppController.pushNotifyUser,
);
router.post(
    '/user',
    validate(MiniappValidate.postUserValidation, {}, {}),
    roleMiniApp,
    UserMiniAppController.postUserMiniapp,
);
router.post('/register/account/status', roleMiniApp, UserMiniAppController.statusGroupStore);
router.post('/register/account', roleMiniApp, UserMiniAppController.registerGroupStore);

export default router;
