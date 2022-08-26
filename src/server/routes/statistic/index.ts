import express from 'express';
import { validate } from 'express-validation';
import { StatisticController } from '@scontroller/index';
import { StatisticValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.get(
    '/today',
    validate(StatisticValidate.statOrderTodayValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderToday,
);
router.get(
    '/type',
    validate(StatisticValidate.statOrderTypeValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderType,
);
router.get(
    '/customer',
    validate(StatisticValidate.statOrderCustomerValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderCustomer,
);
router.get(
    '/user',
    validate(StatisticValidate.statOrderCustomerValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderUser,
);
router.get(
    '/overview',
    validate(StatisticValidate.statOrderValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderOverview,
);
router.get(
    '/overview/user',
    validate(StatisticValidate.statOrdeUserOverviewValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderUserOverview,
);
router.get(
    '/product',
    validate(StatisticValidate.statOrderValidatation, {}, {}),
    roleCMS,
    StatisticController.statOrderProduct,
);

export default router;
