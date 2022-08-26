import { Joi } from 'express-validation';

export const fileUploadValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        offset: Joi.number().integer().allow('', null),
        type_upload: Joi.string().allow(null).valid('receipt'),
    }),
};

export const fileDeleteValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};
