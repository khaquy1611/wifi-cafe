import express from 'express';
import { validate } from 'express-validation';
import { CouponsController } from '@scontroller/index';
import { CouponsValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.get('', validate(CouponsValidate.listCouponsValidation, {}, {}), roleCMS, CouponsController.listCoupons);
router.post(
    '/guest/list',
    validate(CouponsValidate.listCouponGuestCouponValidation, {}, {}),
    CouponsController.listCouponsGuest,
);
router.post(
    '/create',
    validate(CouponsValidate.createCouponValidation, {}, {}),
    roleCMS,
    CouponsController.createCoupon,
);
router.post(
    '/guest/check/status',
    validate(CouponsValidate.checkCouponValidation, {}, {}),
    CouponsController.checkGuestCoupon,
);
router.post(
    '/cancel/coupon/order',
    validate(CouponsValidate.cancelCouponValidation, {}, {}),
    CouponsController.cancelCouponOrder,
);
router.put(
    '/:couponId',
    validate(CouponsValidate.createCouponValidation, {}, {}),
    roleCMS,
    CouponsController.updateCoupon,
);

export default router;
