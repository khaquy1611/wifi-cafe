import { Joi } from 'express-validation';

export const adminCreateValidation = {
    body: Joi.object({
        email: Joi.string().email().required().trim(),
        password: Joi.string().required().trim(),
        group_id: Joi.string().required().alphanum().trim(),
        name: Joi.string().required().trim(),
        role: Joi.string().valid('SUPER_ADMIN', 'GROUP_ADMIN', 'ADMIN').required(),
        avatar: Joi.string().allow('', null).trim(),
        active: Joi.boolean().required(),
        login_multi_device: Joi.boolean(),
        stores: Joi.array().items(Joi.string()),
        permissions: Joi.array().items(Joi.string()),
        role_permissions: Joi.array().items(Joi.string()),
        receive_message_order: Joi.boolean(),
    }),
};

export const adminUpdateValidation = {
    body: Joi.object({
        email: Joi.string().email().required().trim(),
        password: Joi.string().allow('', null).trim(),
        group_id: Joi.string().required().alphanum().trim(),
        name: Joi.string().allow('', null).trim(),
        role: Joi.string().allow('', null),
        active: Joi.boolean(),
        login_multi_device: Joi.boolean(),
        two_factor: Joi.boolean(),
        avatar: Joi.string().allow('', null).trim(),
        stores: Joi.array().items(Joi.string()),
        permissions: Joi.array().items(Joi.string()),
        role_permissions: Joi.array().items(Joi.string()),
        receive_message_order: Joi.boolean(),
    }),
};

export const adminLoginValidation = {
    body: Joi.object({
        email: Joi.string().email().required().trim(),
        password: Joi.string().required().trim(),
        token: Joi.string().min(6).max(6).allow('', null).trim(),
    }),
};

export const adminResetPasswordValidation = {
    body: Joi.object({
        email: Joi.string().email().required().trim(),
        token: Joi.string().min(6).max(6).allow('', null).trim(),
    }),
};

export const adminChangePassValidation = {
    body: Joi.object({
        password: Joi.string().required().trim(),
        password_confirmation: Joi.any()
            .equal(Joi.ref('password'))
            .required()
            .label('Confirm password')
            .messages({ 'any.only': '{{#label}} does not match' }),
    }),
};

export const adminDeleteValidation = {
    body: Joi.object({
        group_id: Joi.string().required().alphanum().trim(),
    }),
};

export const adminIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
    }),
};
