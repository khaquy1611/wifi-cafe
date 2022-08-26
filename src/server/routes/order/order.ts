import express from 'express';
import { validate } from 'express-validation';
import { OrderController, StatisticController } from '@scontroller/index';
import { OrderValidate } from '@svalidator/index';

import roleCMS from '@smiddleware/roleCMS';
import roleMiniApp from '@smiddleware/roleMiniApp';
import createOrder from '@smiddleware/createOrder';

const router = express.Router();

router.post(
    '/create',
    validate(OrderValidate.orderCreateValidation, {}, {}),
    createOrder,
    OrderController.ordersCreateByStaff,
);
router.post(
    '/create/by/app',
    validate(OrderValidate.orderCreateValidation, {}, {}),
    createOrder,
    OrderController.ordersCreateByStaff,
);
router.post(
    '/create/by/staff',
    validate(OrderValidate.orderCreateByStaffValidation, {}, {}),
    roleMiniApp,
    OrderController.ordersCreateByStaff,
);

router.post(
    '/create/by/admin',
    validate(OrderValidate.orderCreateByAdminValidation, {}, {}),
    roleCMS,
    OrderController.ordersCreateMachine,
);
router.post(
    '/create/by/machine',
    validate(OrderValidate.orderCreateByMachineValidation, {}, {}),
    roleMiniApp,
    OrderController.ordersCreateMachine,
);

router.put(
    '/:orderId/status',
    validate(OrderValidate.orderUpdateStatusValidation, {}, {}),
    roleCMS,
    OrderController.ordersUpdateStatus,
);
router.put(
    '/update/quantity/product/:productId',
    validate(OrderValidate.orderUpdateQuantityValidation, {}, {}),
    roleCMS,
    OrderController.ordersUpdateQuantity,
);

router
    .route('/:orderId')
    .get(validate(OrderValidate.orderIndexValidation, {}, {}), roleCMS, OrderController.ordersShow)
    .put(validate(OrderValidate.orderUpdateValidation, {}, {}), roleCMS, OrderController.ordersUpdate);

router.get(
    '/detail/app/:orderId',
    validate(OrderValidate.orderIndexValidation, {}, {}),
    roleMiniApp,
    OrderController.ordersShow,
);

router.get('', validate(OrderValidate.orderIndexValidation, {}, {}), roleCMS, OrderController.ordersIndex);
router.get('/cms/list', validate(OrderValidate.orderCMSIndexValidation, {}, {}), StatisticController.ordersIndexCMS);

export default router;
