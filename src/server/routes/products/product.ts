import express from 'express';
import { validate } from 'express-validation';
import { CategoryController, ProductController } from '@scontroller/index';
import { ProductValidate } from '@svalidator/index';
import roleCMS from '@smiddleware/roleCMS';

const router = express.Router();

router.post(
    '/category/create',
    validate(ProductValidate.categoryProductCreateValidation, {}, {}),
    roleCMS,
    CategoryController.categoryProductCreate,
);
router
    .route('/category/:category_id')
    .put(
        validate(ProductValidate.categoryProductCreateValidation, {}, {}),
        roleCMS,
        CategoryController.categoryProductUpdate,
    )
    .delete(
        validate(ProductValidate.categoryProductDeleteValidation, {}, {}),
        roleCMS,
        CategoryController.categoryProductDelete,
    );
router.get(
    '/category',
    validate(ProductValidate.categoryProductIndexValidation, {}, {}),
    roleCMS,
    CategoryController.categoryProductIndex,
);

router.post(
    '/create',
    validate(ProductValidate.productsCreateValidation, {}, {}),
    roleCMS,
    ProductController.productsCreate,
);
router.post(
    '/import',
    validate(ProductValidate.productsImportValidation, {}, {}),
    roleCMS,
    ProductController.productsImport,
);
router
    .route('/:productId')
    .get(validate(ProductValidate.categoryProductIndexValidation, {}, {}), roleCMS, ProductController.productDetail)
    .put(validate(ProductValidate.productsCreateValidation, {}, {}), roleCMS, ProductController.productsUpdate)
    .delete(
        validate(ProductValidate.categoryProductDeleteValidation, {}, {}),
        roleCMS,
        ProductController.productsDelete,
    );
router.get('', validate(ProductValidate.productsIndexValidation, {}, {}), roleCMS, ProductController.productsIndex);

export default router;
