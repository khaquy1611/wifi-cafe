import { Joi } from 'express-validation';

export const transactionValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const bankAccountInfoValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        bankCode: Joi.string().required().alphanum().trim(),
        accountNo: Joi.string().required().alphanum().trim(),
        accountType: Joi.string().valid('account', 'card').required(),
    }),
};

export const makeValidation = {
    body: Joi.object().keys({
        remember: Joi.boolean(),
        token: Joi.string().min(6).max(6).required(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        bankCode: Joi.string().required().alphanum().trim(),
        accountNo: Joi.string().required().alphanum().trim(),
        accountType: Joi.string().valid('account', 'card').required(),
        accountName: Joi.string().required().trim(),
        amount: Joi.number().integer().required(),
        message: Joi.string().allow('', null),
        contractNumber: Joi.string().allow('', null),
        customerPhoneNumber: Joi.string().allow('', null),
    }),
};
