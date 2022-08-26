import express from 'express';
import { validate } from 'express-validation';
import { StoreSubDepartmentController, StoreDepartmentController } from '@scontroller/index';
import { StoreValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post(
    '/create',
    validate(StoreValidate.storeDepartmentCreateValidation, {}, {}),
    roleCMS,
    StoreDepartmentController.storesDepartmentCreate,
);
router
    .route('/:deparmentId')
    .put(
        validate(StoreValidate.storeDepartmentCreateValidation, {}, {}),
        roleCMS,
        StoreDepartmentController.storesDepartmentUpdate,
    )
    .delete(
        validate(StoreValidate.storeDepartmentDeleteValidation, {}, {}),
        roleCMS,
        StoreDepartmentController.storesDepartmentDelete,
    );
router.get(
    '',
    validate(StoreValidate.storeDepartmentIndexValidation, {}, {}),
    StoreDepartmentController.storesDepartmentIndex,
);

router.post(
    '/sub/create',
    validate(StoreValidate.storeSubDepartmentCreateValidation, {}, {}),
    roleCMS,
    StoreSubDepartmentController.storesSubDepartmentCreate,
);
router
    .route('/sub/:subDeparmentId')
    .put(
        validate(StoreValidate.storeSubDepartmentCreateValidation, {}, {}),
        roleCMS,
        StoreSubDepartmentController.storesSubDepartmentUpdate,
    )
    .delete(
        validate(StoreValidate.storeDepartmentDeleteValidation, {}, {}),
        roleCMS,
        StoreSubDepartmentController.storesSubDepartmentDelete,
    );
router.put(
    '/sub/:subDeparmentId/status',
    validate(StoreValidate.storeSubDepartmentStatusValidation, {}, {}),
    roleCMS,
    StoreSubDepartmentController.ordersUpdateStatusDeparment,
);
router.post(
    '/sub/change/table',
    validate(StoreValidate.orderSubDepartmentChangeTableValidation, {}, {}),
    roleCMS,
    StoreSubDepartmentController.orderschangeSubDeparment,
);
router.get(
    '/sub',
    validate(StoreValidate.storeDepartmentIndexValidation, {}, {}),
    roleCMS,
    StoreSubDepartmentController.storesSubDepartmentIndex,
);

export default router;
