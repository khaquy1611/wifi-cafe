import { Joi } from 'express-validation';

export const storesCreateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        logo: Joi.string().allow('', null).trim(),
        phone_number: Joi.string().allow('', null).trim(),
        message: Joi.string().allow('', null).trim(),
        address: Joi.string().allow('', null).trim(),
        lat: Joi.number().min(-90).max(90).required(),
        long: Joi.number().min(-180).max(180).required(),
        order_card_table: Joi.number().allow('', null),
        active: Joi.boolean(),
        order: Joi.number().integer(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().allow('', null).trim(),
        ips: Joi.array().items(Joi.string()),
        api_key: Joi.string().allow('', null).trim(),
        secret_key: Joi.string().allow('', null).trim(),
        partner_code: Joi.string().allow('', null).trim(),
        ip: Joi.string().allow('', null).trim(),
        messenger: Joi.string().allow('', null).trim(),
        zalo: Joi.string().allow('', null).trim(),
    }),
};

export const storesIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
    }),
};

export const groupStoresCreateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
    }),
};

export const groupStoresUpdateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        logo: Joi.string().allow('', null).trim(),
        active: Joi.boolean(),
        api_key: Joi.string().allow('', null).trim(),
        secret_key: Joi.string().allow('', null).trim(),
        partner_code: Joi.string().allow('', null).trim(),
        group_id: Joi.string().required().alphanum().trim(),
    }),
};

export const storeDepartmentCreateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        active: Joi.boolean(),
        order: Joi.number().integer(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const storeSubDepartmentCreateValidation = {
    body: Joi.object({
        name: Joi.string().required().trim(),
        desc: Joi.string().allow('', null).trim(),
        chair: Joi.number().integer().required(),
        active: Joi.boolean(),
        order: Joi.number().integer(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        department_id: Joi.string().required().alphanum().trim(),
    }),
};

export const storeSubDepartmentStatusValidation = {
    body: Joi.object({
        type: Joi.string().valid('reset', 'service').required(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        department_id: Joi.string().required().alphanum().trim(),
    }),
};

export const orderSubDepartmentChangeTableValidation = {
    body: Joi.object({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        department_id: Joi.string().required().alphanum().trim(),
        sub_department_id: Joi.string().required().alphanum().trim(),
        order_id: Joi.string().required().alphanum().trim(),
    }),
};

export const storeDepartmentDeleteValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const storeDepartmentIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        app: Joi.boolean().allow('', null),
    }),
};
