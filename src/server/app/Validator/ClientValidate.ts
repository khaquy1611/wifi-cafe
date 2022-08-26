import { Joi } from 'express-validation';

export const clientIndexValidation = {
    query: Joi.object().keys({
        q: Joi.string()
            .pattern(/^[A-Za-z0-9]{6,6}-[A-Za-z0-9]{6,6}$/)
            .allow('', null, 'undefined'),
    }),
};

export const findStoreLocationValidation = {
    query: Joi.object().keys({
        lat: Joi.number().required(),
        long: Joi.number().required(),
    }),
};

export const customerRegisterValidation = {
    body: Joi.object().keys({
        phone_number: Joi.string().required().trim(),
    }),
};
