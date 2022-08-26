import { Joi } from 'express-validation';

export const create = {
    body: Joi.object({
        name: Joi.string().required().trim().required(),
        type: Joi.string().required().trim().required().valid('import', 'export'),
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
};

export const list = {
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        type: Joi.string().trim(),
        name: Joi.string().trim(),
        page: Joi.number().integer().default(1),
    }),
};
