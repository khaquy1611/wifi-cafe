import { Joi } from 'express-validation';

export const pushNotifyValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        order_id: Joi.string().required().alphanum().trim(),
        customer_id: Joi.string().allow('', null),
    }),
};

export const postUserValidation = {
    body: Joi.object().keys({
        workspace_id: Joi.string().required().trim(),
        email: Joi.string().email().required().trim(),
    }),
};
