import { Joi } from 'express-validation';

export const create = {
    body: Joi.object({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        type: Joi.string().required().trim().valid('import', 'export'),
        receipt_type: Joi.string().required().trim(),
        code: Joi.string().trim(),
        name: Joi.string().trim(),
        file: Joi.string().trim(),
        desc: Joi.string().trim().allow(null, ''),
        link_warehouse: Joi.array()
            .items(
                Joi.object({
                    warehouse_id: Joi.string().alphanum().required().trim(),
                    quantity: Joi.number().required(),
                }),
            )
            .required()
            .min(1),
        status: Joi.string().required().trim().valid('export', 'import', 'order'),
    }),
};

export const list = {
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
        type: Joi.string().trim(),
        name: Joi.string().trim(),
        code: Joi.string().trim(),
        from: Joi.number().integer().min(0),
        to: Joi.number().integer().min(0),
        status: Joi.string().trim().valid('export', 'import', 'order', 'cancel'),
        receipt_type: Joi.string().trim(),
        create_by: Joi.string().trim(),
        page: Joi.number().integer().min(1).default(1),
    }),
};

export const updateStatus = {
    body: Joi.object({
        status: Joi.string().trim().valid('order', 'cancel', 'import'),
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
    params: Joi.object({
        id: Joi.string().alphanum().required().trim(),
    }),
};

export const detail = {
    params: Joi.object({
        id: Joi.string().alphanum().required().trim(),
    }),
    query: Joi.object().keys({
        group_id: Joi.string().alphanum().required().trim(),
        store_id: Joi.string().alphanum().required().trim(),
    }),
};
