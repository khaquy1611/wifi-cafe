import { Joi } from 'express-validation';

export const listCouponsValidation = {
    query: Joi.object({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        offset: Joi.number().integer().allow('', null),
        discount_type: Joi.string()
            .valid('fixed_cart', 'percent_cart', 'fixed_product', 'percent_product')
            .allow('', null),
        code: Joi.string().allow('', null).trim(),
        platform: Joi.string().valid('web', 'miniapp', 'app').allow('', null),
    }),
};

export const createCouponValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        code: Joi.string().alphanum().allow('', null).trim(),
        amount: Joi.number().integer().required(),
        discount_type: Joi.string().valid('fixed_cart', 'percent_cart', 'fixed_product', 'percent_product').required(),
        name: Joi.string().required().trim(),
        date_start: Joi.date().timestamp().required(),
        date_expires: Joi.date().timestamp().required(),
        limit_by_day: Joi.number().integer(),
        platform: Joi.array().items(Joi.string()),
        product_ids: Joi.array().items(Joi.string()),
        usage_limit: Joi.number().integer(),
        duplicate: Joi.boolean(),
        number_duplicate: Joi.number().integer().min(1).max(20),
        usage_limit_per_user: Joi.number().integer(),
        minimum_amount: Joi.number().integer(),
        maximum_amount: Joi.number().integer(),
    }),
};

export const checkCouponValidation = {
    body: Joi.object().keys({
        order_id: Joi.string().allow('', null).trim(),
        admin: Joi.boolean(),
        customer_id: Joi.string().allow('', null).trim(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        code: Joi.string().required().alphanum().trim(),
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                    })
                    .required(),
            )
            .required(),
        total: Joi.number().integer().required(),
        platform: Joi.string().valid('web', 'miniapp', 'app').required(),
    }),
};

export const listCouponGuestCouponValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                    })
                    .required(),
            )
            .required(),
        total: Joi.number().integer().required(),
        platform: Joi.string().valid('web', 'miniapp', 'app').required(),
    }),
};

export const cancelCouponValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        order_id: Joi.string().required().alphanum().trim(),
    }),
};
