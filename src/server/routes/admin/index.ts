import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from 'express-validation';
import { AdminController } from '@scontroller/index';
import { AdminValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 10 request
    handler: (_req: Request, res: Response) => {
        return res.status(429).json({
            errorCode: 429,
            message: 'Bạn đã đăng nhập thất bại nhiều lần, vui lòng thử lại sau vài phút',
        });
    },
});

router.post('/logout', AdminController.adminLogout);
router.post('/login', validate(AdminValidate.adminLoginValidation, {}, {}), loginLimiter, AdminController.adminLogin);
router.post('/create', validate(AdminValidate.adminCreateValidation, {}, {}), roleCMS, AdminController.adminCreate);
router.put(
    '/change/password/:adminId',
    validate(AdminValidate.adminChangePassValidation, {}, {}),
    AdminController.adminChangePassword,
);
router.post(
    '/request/reset/password',
    validate(AdminValidate.adminResetPasswordValidation, {}, {}),
    AdminController.adminRequestResetPassword,
);
router.post(
    '/new/reset/password',
    validate(AdminValidate.adminChangePassValidation, {}, {}),
    AdminController.adminNewResetPassword,
);
router
    .route('/:adminId')
    .put(validate(AdminValidate.adminUpdateValidation, {}, {}), AdminController.adminUpdate)
    .delete(validate(AdminValidate.adminDeleteValidation, {}, {}), roleCMS, AdminController.adminDelete)
    .get(AdminController.adminInfo);
router.get('', validate(AdminValidate.adminIndexValidation, {}, {}), roleCMS, AdminController.adminIndex);

export default router;
