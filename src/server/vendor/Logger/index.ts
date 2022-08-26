import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'server/storage/logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const filenameNode = path.join(logDir, 'node.log');

const timezoned = () => {
    return new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
    });
};

const myFormat = format.printf(({ message, timestamp }) => {
    return `[${timestamp}] ${message}`;
});

const logger = createLogger({
    level: 'debug',
    format: format.combine(format.simple(), format.timestamp({ format: timezoned }), myFormat),
    transports: [
        new transports.File({
            filename: filenameNode,
        }),
    ],
});

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(
//         new winston.transports.Console({
//             format: format.combine(format.colorize()),
//         }),
//     );
// }

export default logger;
