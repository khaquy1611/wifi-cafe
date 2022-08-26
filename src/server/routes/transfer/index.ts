import express from 'express';
import { validate } from 'express-validation';
import { TransferController } from '@scontroller/index';
import { TransferValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post(
    '/bank/account/info',
    validate(TransferValidate.bankAccountInfoValidation, {}, {}),
    roleCMS,
    TransferController.bankAccountInfo,
);
router.post('/make', validate(TransferValidate.makeValidation, {}, {}), roleCMS, TransferController.transferMake);
router.get(
    '/accounts/balance',
    validate(TransferValidate.transactionValidation, {}, {}),
    roleCMS,
    TransferController.accountBalance,
);
router.get(
    '/transaction/:partnerRefId',
    validate(TransferValidate.transactionValidation, {}, {}),
    roleCMS,
    TransferController.transferTransaction,
);
router.get(
    '/bank/account/archive',
    validate(TransferValidate.transactionValidation, {}, {}),
    roleCMS,
    TransferController.bankAccountArchive,
);

export default router;
