import { NextFunction, Request, Response } from 'express';
import { decode } from 'jsonwebtoken';
import { Config } from '@smodel/index';
import ErrorHandler from '@sexceptions/index';

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.originalUrl.startsWith('/api')) {
            if (req.headers['x-real-ip'] !== process.env.IP_SERVER) {
                const xMiniApp = req.headers['x-miniapp-auth'] as string;
                const values = [req.headers['x-real-ip']];
                if (xMiniApp) {
                    const decode_token = decode(xMiniApp) as {
                        claims: { staff_id: string; workspace_id: string; app_id: string };
                    };
                    values.push(decode_token.claims.staff_id);
                }
                const blacklist = await Config.findOne({ key: 'blacklist', values: { $in: values } });
                if (blacklist) {
                    return res.status(403).json({
                        errorCode: 4030,
                        message: 'Bạn đã bị ban khỏi hệ thống',
                    });
                }
            }
        }
        return next();
    } catch (e) {
        return next(
            new ErrorHandler({
                message: `[Middleware Guest] ${e.message}`,
                name: e.name,
            }),
        );
    }
};
