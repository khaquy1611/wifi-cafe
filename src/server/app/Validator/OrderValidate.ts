import { Joi } from 'express-validation';

export const orderIndexValidation = {
    query: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
    }),
};

export const orderUpdateQuantityValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        quantity: Joi.number().integer().required(),
    }),
};

export const orderCMSIndexValidation = {
    query: Joi.object().keys({
        id: Joi.string().allow('', null).trim(),
        orderId: Joi.string().allow('', null).trim(),
        customer_id: Joi.string().allow('', null).trim(),
        type: Joi.string().allow('', null).trim(),
        order_closing: Joi.string().allow('', null).trim(),
        discount_id: Joi.string().allow('', null).trim(),
        user_id: Joi.string().allow('', null).trim(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        offset: Joi.number().integer(),
        start: Joi.date().timestamp().allow('', null),
        end: Joi.date().timestamp().allow('', null),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').allow('', null).trim(),
        status_order: Joi.string().valid('at-place', 'take-away').allow('', null).trim(),
        status: Joi.string().valid('pending', 'processing', 'completed', 'cancelled').allow('', null).trim(),
    }),
};

export const orderUpdateStatusValidation = {
    body: Joi.object().keys({
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        type: Joi.string().valid('cancel_order', 'complete_service', 'complete_payment').required(),
        note: Joi.string().allow('', null).trim(),
    }),
};

export const orderUpdateValidation = {
    body: Joi.object().keys({
        type: Joi.string().valid('save', 'payment').required(),
        group_id: Joi.string().required().alphanum().trim(),
        store_id: Joi.string().required().alphanum().trim(),
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                        note: Joi.string().allow('', null).trim(),
                    })
                    .required(),
            )
            .required(),
        total: Joi.number().integer().required(),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').required(),
        status_order: Joi.string().valid('at-place', 'take-away').required(),
        sub_department_id: Joi.string().allow('', null).trim(),
        bank_code: Joi.string()
            .pattern(/^[A-Z]+$/)
            .allow('', null)
            .trim(),
        discount_amount: Joi.number().integer().allow(0, null),
        discount_code: Joi.string().alphanum().allow('', null),
        discount_id: Joi.string().alphanum().allow('', null),
        discount_name: Joi.string().allow('', null),
        customer_phone_number: Joi.string().allow('', null),
    }),
};

export const orderCreateValidation = {
    body: Joi.object().keys({
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                        note: Joi.string().allow('', null).trim(),
                    })
                    .required(),
            )
            .required(),
        qr_code: Joi.string()
            .pattern(/^[A-Za-z0-9]{6,6}-[A-Za-z0-9]{6,6}$/)
            .required(),
        total: Joi.number().integer().required(),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').required(),
        status_order: Joi.string().valid('at-place').required(),
        bank_code: Joi.string()
            .pattern(/^[A-Z]+$/)
            .allow('', null)
            .trim(),
        agent: Joi.string().required(),
        c: Joi.string().required(),
        t: Joi.date().timestamp().required(),
        discount_amount: Joi.number().integer().allow(0, null),
        discount_code: Joi.string().alphanum().allow('', null),
        discount_id: Joi.string().alphanum().allow('', null),
        discount_name: Joi.string().allow('', null),
        customer_name: Joi.string().allow('', null),
        customer_phone_number: Joi.string().allow('', null),
        customer_avatar: Joi.string().allow('', null),
        deviceToken: Joi.string().allow('', null),
        platform: Joi.string().allow('', null),
        store_in_app: Joi.string().allow('', null),
    }),
};

export const orderCreateByStaffValidation = {
    body: Joi.object().keys({
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                        note: Joi.string().allow('', null).trim(),
                    })
                    .required(),
            )
            .required(),
        qr_code: Joi.string()
            .pattern(/^[A-Za-z0-9]{6,6}-[A-Za-z0-9]{6,6}$/)
            .required(),
        total: Joi.number().integer().required(),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').required(),
        status_order: Joi.string().valid('at-place', 'take-away').required(),
        bank_code: Joi.string()
            .pattern(/^[A-Z]+$/)
            .allow('', null)
            .trim(),
        agent: Joi.string().required(),
        discount_amount: Joi.number().integer().allow(0, null),
        discount_code: Joi.string().alphanum().allow('', null),
        discount_id: Joi.string().alphanum().allow('', null),
        discount_name: Joi.string().allow('', null),
    }),
};

export const orderCreateByAdminValidation = {
    body: Joi.object().keys({
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                        note: Joi.string().allow('', null).trim(),
                    })
                    .required(),
            )
            .required(),
        total: Joi.number().integer().required(),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').required(),
        status_order: Joi.string().valid('at-place', 'take-away').required(),
        type: Joi.string().valid('save', 'payment').required(),
        bank_code: Joi.string()
            .pattern(/^[A-Z]+$/)
            .allow('', null)
            .trim(),
        group_id: Joi.string().required(),
        store_id: Joi.string().required(),
        sub_department_id: Joi.string().allow('', null).trim(),
        discount_amount: Joi.number().integer().allow(0, null),
        discount_code: Joi.string().alphanum().allow('', null),
        discount_id: Joi.string().alphanum().allow('', null),
        discount_name: Joi.string().allow('', null),
        customer_phone_number: Joi.string().allow('', null),
    }),
};

export const orderCreateByMachineValidation = {
    body: Joi.object().keys({
        list_products: Joi.array()
            .items(
                Joi.object()
                    .keys({
                        product_id: Joi.string().required().alphanum().trim(),
                        name: Joi.string().required(),
                        logo: Joi.string().required(),
                        quantity: Joi.number().integer().required(),
                        price: Joi.number().integer().required(),
                        note: Joi.string().allow('', null).trim(),
                    })
                    .required(),
            )
            .required(),
        total: Joi.number().integer().required(),
        payment_method: Joi.string().valid('EWALLET', 'MONEY', 'ATM', 'CC').required(),
        bank_code: Joi.string()
            .pattern(/^[A-Z]+$/)
            .allow('', null)
            .trim(),
        machine_id: Joi.string().required(),
        discount_amount: Joi.number().integer().allow(0, null),
        discount_code: Joi.string().alphanum().allow('', null),
        discount_id: Joi.string().alphanum().allow('', null),
        discount_name: Joi.string().allow('', null),
    }),
};
