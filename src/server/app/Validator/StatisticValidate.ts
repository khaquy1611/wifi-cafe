import { Joi } from 'express-validation';

export const statOrderValidatation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        start: Joi.date().timestamp().required(),
        end: Joi.date().timestamp().required(),
        store_id: Joi.string().allow('', null).alphanum().trim(),
        type: Joi.string().allow('', null).alphanum().trim(),
    }),
};

export const statOrdeUserOverviewValidatation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        user_id: Joi.string().required().alphanum().trim(),
        start: Joi.date().timestamp().required(),
        end: Joi.date().timestamp().required(),
        store_id: Joi.string().allow('', null).alphanum().trim(),
    }),
};

export const statOrderTypeValidatation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        start: Joi.date().timestamp().required(),
        end: Joi.date().timestamp().required(),
        type: Joi.string().valid('payment', 'status_order').required(),
        store_id: Joi.string().allow('', null).alphanum().trim(),
    }),
};

export const statOrderCustomerValidatation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        start: Joi.date().timestamp().required(),
        end: Joi.date().timestamp().required(),
        store_id: Joi.string().allow('', null).alphanum().trim(),
    }),
};

export const statOrderTodayValidatation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        status: Joi.string().valid('pending', 'completed', 'cancelled', 'processing').allow('', null),
        store_id: Joi.string().allow('', null).alphanum().trim(),
    }),
};
