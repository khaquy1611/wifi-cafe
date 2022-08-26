import { Joi } from 'express-validation';

export const paymentMethodUpdateValidation = {
    body: Joi.object({
        order: Joi.number().integer(),
        active: Joi.boolean(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const paymentOrderIndexValidation = {
    body: Joi.object({
        order_id: Joi.string().required().alphanum().trim(),
        user_id: Joi.string().required().alphanum().trim(),
    }),
};

export const paymentRequestOrderValidation = {
    body: Joi.object({
        order_id: Joi.string().required().alphanum().trim(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        platform: Joi.string().valid('web', 'miniapp', 'app').allow('', null),
    }),
};

export const paymentMethodIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};
