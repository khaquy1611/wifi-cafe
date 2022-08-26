import express from 'express';
import { validate } from 'express-validation';
import { PaymentController } from '@scontroller/index';
import { PaymentValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';
import roleMiniApp from '@smiddleware/roleMiniApp';

const router = express.Router();

router.put(
    '/method/:paymentMethodId',
    validate(PaymentValidate.paymentMethodUpdateValidation, {}, {}),
    roleCMS,
    PaymentController.paymentMethodUpdate,
);
router.get(
    '/method',
    validate(PaymentValidate.paymentMethodIndexValidation, {}, {}),
    roleCMS,
    PaymentController.paymentMethodIndex,
);
router.post(
    '/order',
    validate(PaymentValidate.paymentOrderIndexValidation, {}, {}),
    roleMiniApp,
    PaymentController.paymentOrderIndex,
);
router.post(
    '/request',
    validate(PaymentValidate.paymentRequestOrderValidation, {}, {}),
    roleMiniApp,
    PaymentController.paymentRequestOrder,
);
export default router;
