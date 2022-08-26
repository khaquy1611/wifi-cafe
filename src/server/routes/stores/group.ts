import express from 'express';
import { validate } from 'express-validation';
import { GroupStoreController } from '@scontroller/index';
import { StoreValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post(
    '/create',
    validate(StoreValidate.groupStoresCreateValidation, {}, {}),
    roleCMS,
    GroupStoreController.groupStoresCreate,
);
router.put(
    '/:groupId',
    validate(StoreValidate.groupStoresUpdateValidation, {}, {}),
    roleCMS,
    GroupStoreController.groupStoresUpdate,
);
router.get('', GroupStoreController.groupStoresIndex);

export default router;
