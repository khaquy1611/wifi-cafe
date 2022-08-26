import { Joi } from 'express-validation';

export const productsCreateValidation = {
    body: Joi.object({
        id: Joi.string().allow('', null).trim(),
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        logo: Joi.string().required(),
        price: Joi.number().integer().required(),
        status: Joi.string().required().valid('available', 'unavailable').trim(),
        order: Joi.number().integer(),
        tags: Joi.array().allow(null),
        category_id: Joi.string().alphanum().required().trim(),
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        link_warehouse: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        id: Joi.string().alphanum().required().trim(),
                        quantity: Joi.number().required(),
                    })
                    .required(),
            )
            .allow(null),
        amount: Joi.number().allow(null),
        min_amount: Joi.number().allow(null),
        type_warehouse: Joi.string().valid('off', 'ingredient', 'item').allow(null).trim(),
    }),
};

export const productsImportValidation = {
    body: Joi.object({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        id: Joi.string().allow('', null).alphanum().trim(),
                        name: Joi.string().required(),
                        desc: Joi.string().allow('', null).trim(),
                        logo: Joi.string().allow('', null).trim(),
                        price: Joi.number().integer().required(),
                        status: Joi.string().required().valid('available', 'unavailable').trim(),
                        category_id: Joi.string().allow('', null).trim(),
                        order: Joi.number().integer().required(),
                    })
                    .max(200)
                    .required(),
            )
            .required(),
    }),
};

export const productsIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
};

export const categoryProductCreateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        logo: Joi.string().allow('', null).trim(),
        active: Joi.boolean(),
        order: Joi.number().integer(),
        store_id: Joi.string().alphanum().required().trim(),
        group_id: Joi.string().alphanum().required().trim(),
    }),
};

export const categoryProductDeleteValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
};

export const categoryProductIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
};
