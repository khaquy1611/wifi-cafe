import crypto from 'crypto';
import { NextFunction } from 'express';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { getCookie } from '@shelpers/index';

export default (socket: Socket, next: NextFunction) => {
    try {
        const socketHeader = socket.handshake.headers as { cookie: string; 'user-agent': string; 'x-real-ip': string };
        const tokenqr = getCookie('tokenqr', socketHeader.cookie);
        if (tokenqr) {
            verify(tokenqr, process.env.JWT_AUTHORIZATION as string);
            return next();
        }
        const c1 = getCookie('C1', socketHeader.cookie);
        if (c1) {
            const decoded = verify(c1, process.env.JWT_AUTHORIZATION_SOCKET as string) as { data: string };
            if (
                decoded.data ===
                crypto
                    .createHash('md5')
                    .update(`${socketHeader['user-agent']}${socketHeader['x-real-ip']}`)
                    .digest('hex')
            ) {
                return next();
            }
        }
        return next('success completed');
    } catch (err) {
        return next(new Error('success completed'));
    }
};
