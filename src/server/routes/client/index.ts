import express from 'express';
import { validate } from 'express-validation';
import { ClientController } from '@scontroller/index';
import { ClientValidate } from '@svalidator/index';
import roleMiniApp from '@smiddleware/roleMiniApp';

const router = express.Router();

router.get(
    '/find/store/location',
    validate(ClientValidate.findStoreLocationValidation, {}, {}),
    ClientController.loadStoreByLocation,
);

router.get(
    '/category/products',
    validate(ClientValidate.clientIndexValidation, {}, {}),
    ClientController.categoryProductClient,
);
router.get('/products', validate(ClientValidate.clientIndexValidation, {}, {}), ClientController.productsIndexClient);
router.get('/store/info', validate(ClientValidate.clientIndexValidation, {}, {}), ClientController.storesIndexClient);

router.get('/tv/category/products', roleMiniApp, ClientController.categoryProductTVClient);
router.get('/tv/products', roleMiniApp, ClientController.productsIndexTVClient);
router.get('/tv/store/info', roleMiniApp, ClientController.storesIndexTVClient);
router.get('/tv/store/list', roleMiniApp, ClientController.allStoresIndexTVClient);

// Register account customer
router.post(
    '/customer/register',
    validate(ClientValidate.customerRegisterValidation, {}, {}),
    ClientController.customerRegister,
);

export default router;
