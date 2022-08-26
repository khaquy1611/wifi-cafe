import { Joi } from 'express-validation';

export const create = {
    body: Joi.object({
        name: Joi.string().required().trim().required(),
        type: Joi.string().required().trim().required().valid('ingredient'),
        amount: Joi.number().default(0).min(0),
        min_amount: Joi.number().default(0).min(0),
        unit: Joi.string().required().trim(),
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
        status: Joi.string().trim(),
        page: Joi.number().integer().default(1),
        limit: Joi.number().integer().default(20).max(100),
        exports: Joi.boolean().default(false),
    }),
};

export const importList = {
    body: Joi.object({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        ware_houses: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        name: Joi.string().required(),
                        type: Joi.string().required().valid('ingredient'),
                        amount: Joi.number().required(),
                        min_amount: Joi.number().required(),
                        unit: Joi.string().required().trim(),
                    })
                    .required(),
            )
            .max(200)
            .required(),
    }),
};

export const update = {
    body: Joi.object({
        name: Joi.string().trim(),
        unit: Joi.string().trim(),
        min_amount: Joi.number(),
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
    params: Joi.object({
        id: Joi.string().alphanum().required().trim(),
    }),
};

export const history = {
    query: Joi.object({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        page: Joi.number().integer().default(1),
        name: Joi.string().trim(),
        from: Joi.number().integer().min(0),
        to: Joi.number().integer().min(0),
    }),
};
