import { Joi } from 'express-validation';

// eslint-disable-next-line import/prefer-default-export
export const list = {
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        from: Joi.number().integer().min(0),
        to: Joi.number().integer().min(0),
        type: Joi.string().trim().valid('ingredient', 'item'),
        page: Joi.number().integer().default(1),
        exports: Joi.boolean().default(false),
        limit: Joi.number().integer().valid(10, 20, 50, 100),
        status: Joi.string().trim().valid('low', 'empty', 'enough'),
    }),
};
