import { Joi } from 'express-validation';

export const listCustomerValidation = {
    query: Joi.object({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        offset: Joi.number().integer().allow('', null),
        phone_number: Joi.string().allow('', null),
    }),
};

export const historyCustomerOrderValidation = {
    query: Joi.object().keys({
        offset: Joi.number().integer().allow('', null),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const createCustomerValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        name: Joi.string().trim(),
        email: Joi.string().email().allow('', null).trim(),
        phone_number: Joi.string().trim(),
        birthday: Joi.string().allow('', null).trim(),
        avatar: Joi.string().allow('', null).trim(),
        gender: Joi.string().valid('MALE', 'FEMALE').allow('', null).trim(),
    }),
};
