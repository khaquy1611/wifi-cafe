import express from 'express';
import { validate } from 'express-validation';
import { CustomerController } from '@scontroller/index';
import { CustomerValidate } from '@svalidator/index';

import roleCMS from '@smiddleware/roleCMS';
import roleMiniApp from '@smiddleware/roleMiniApp';

const router = express.Router();

router.post(
    '/create',
    validate(CustomerValidate.createCustomerValidation, {}, {}),
    roleCMS,
    CustomerController.createCustomer,
);
router.put(
    '/:customerId',
    validate(CustomerValidate.createCustomerValidation, {}, {}),
    roleCMS,
    CustomerController.updateCustomer,
);
router.get(
    '/list',
    validate(CustomerValidate.listCustomerValidation, {}, {}),
    roleCMS,
    CustomerController.listCustomer,
);
router.get(
    '/info/:customerId',
    validate(CustomerValidate.listCustomerValidation, {}, {}),
    roleCMS,
    CustomerController.infoCustomer,
);
router.get(
    '/history/order/:customerId',
    validate(CustomerValidate.historyCustomerOrderValidation, {}, {}),
    roleMiniApp,
    CustomerController.historyOrderCustomer,
);

export default router;
