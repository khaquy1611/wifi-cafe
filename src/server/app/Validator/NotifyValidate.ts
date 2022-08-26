import { Joi } from 'express-validation';

export const readLogValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        notify_id: Joi.string().allow('', null),
    }),
};

export const logActionValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        offset: Joi.number().integer().allow('', null),
        key: Joi.string().allow('', null),
        user_id: Joi.string().allow('', null),
    }),
};
