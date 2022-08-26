import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validation';
import ErrorHandler from './index';
import logger from '../../vendor/Logger';
import sendTelegram from '../../vendor/Telegram';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Handler = (err: ErrorHandler, req: Request, res: Response, _next: NextFunction) => {
    const ip = req.headers['x-real-ip'];
    try {
        const errorLog = err;
        if (
            err.name &&
            (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError')
        ) {
            errorLog.statusCode = 403;
            errorLog.messageResponse = 'Mã xác thực không hợp lệ';
            errorLog.statusResponse = 4030;
        }
        if (err.name && err.name === 'CastError') {
            errorLog.statusCode = 400;
            errorLog.messageResponse = 'Yêu cầu dữ liệu không hợp lệ';
            errorLog.statusResponse = 4000;
        }
        const arrName = ['ValidationError', 'JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError', 'CouponCode'];
        if (!arrName.includes(err.name)) {
            logger.error(
                `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(req.body)} - Message: ${
                    err.message
                } - Stack: ${err.stack}`,
            );
            sendTelegram({
                message: `<pre>💥 ${req.originalUrl}:${req.method.toUpperCase()}</pre>
<i>🖱 ${ip}</i>
<i>💻 ${req.headers['user-agent']}</i>
<b>❌ ${err.message}</b>`,
            });
        }
        let message = errorLog.messageResponse ? errorLog.messageResponse : 'Tác vụ không thành công';
        const statusCode = errorLog.statusCode || 500;
        const statusResponse = errorLog.statusResponse || 5000;
        if (process.env.APP_DEBUG === 'development') {
            if (err instanceof ValidationError) {
                return res.status(statusCode).json(errorLog);
            }
            message = errorLog.messageResponse ? errorLog.messageResponse : errorLog.message;
        }
        return res.status(statusCode).json({
            errorCode: statusResponse,
            message,
        });
    } catch (error) {
        logger.error(
            `${req.originalUrl}:${req.method.toUpperCase()} - Body: ${JSON.stringify(req.body)} - Message: ${
                error.message
            } - Stack: ${error.stack}`,
        );
        sendTelegram({
            message: `<pre>💥 ${req.originalUrl}:${req.method.toUpperCase()}</pre>
<i>🖱 ${ip}</i>
<i>💻 ${req.headers['user-agent']}</i>
<b>❌ ${err.message}</b>`,
        });
        return res.status(error.statusCode || 500).json({
            errorCode: error.statusResponse || 5000,
            message: err.messageResponse ? err.messageResponse : 'Tác vụ không thành công',
        });
    }
};

export default Handler;
