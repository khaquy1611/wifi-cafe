import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { alphabeticalSortedQuery } from '@shelpers/index';
import { CookieOrder } from '@smodel/index';
import ErrorHandler from '@sexceptions/index';

export default async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const { c } = req.body;
        const c_hash = c;
        delete req.body.c;
        if (
            c_hash !==
            crypto
                .createHmac('sha256', process.env.SECRET_ORDER as string)
                .update(alphabeticalSortedQuery(req.body))
                .digest('hex')
        ) {
            throw new ErrorHandler({
                message: `Mã xác thực không giống nhau`,
                messageResponse: 'Mã xác thực không hợp lệ',
            });
        }
        const cookie_order = await CookieOrder.findOne({ id: c_hash });
        if (cookie_order) {
            throw new ErrorHandler({
                message: `Mã xác thực này đã được sử dụng`,
                messageResponse: 'Mã xác thực không hợp lệ',
            });
        }
        await new CookieOrder({ id: c_hash }).save();
        return next();
    } catch (e) {
        return next(
            new ErrorHandler({
                message: `[Create Order] ${e.message}`,
                name: e.name,
            }),
        );
    }
};
