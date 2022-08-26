/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'module-alias/register';
import express, { Application, Request, Response } from 'express';
import nextJS from 'next';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'http';
import { Socket, Server as ServerSocket } from 'socket.io';
import fs, { createReadStream } from 'fs';
import { join } from 'path';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
// @ts-ignore
import xss from 'xss-clean';
// @ts-ignore
import mongoSanitize from 'express-mongo-sanitize';
import { callBackBank, notifyMessage } from './app/Service';
import eventSocket from './event';
import router from './routes';
import roleAgentIP from './app/Middleware/roleAgentIP';
import HandlerExceptions from './app/Exceptions/Handler';
import catchAsync from './app/Exceptions/CatchAsync';
import cronTab from './app/Console';

const port = parseInt(process.env.APP_PORT || '5000', 10);
const dev = process.env.NODE_ENV !== 'production';
const appNext = nextJS({ dev });
const nextHandler = appNext.getRequestHandler();

appNext.prepare().then(() => {
    mongoose.connect(process.env.DB_DSN as string, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
    });
    const app: Application = express();
    const server = new Server(app);
    const io = new ServerSocket(server);

    const onConnection = (socket: Socket) => {
        eventSocket(io, socket);
    };

    io.on('connection', onConnection);

    app.set('trust proxy', 1);

    app.use(cors());
    app.use(
        helmet({
            contentSecurityPolicy: false,
            xssFilter: false,
        }),
    );
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(xss());
    app.use(mongoSanitize());

    app.use(roleAgentIP);

    cronTab();

    app.use('/api', router);
    app.post(
        '/callback/ipn',
        catchAsync(async (req: Request, res: Response) => {
            const ipn = await callBackBank(req.body);
            io.to(ipn.store_id as string).emit('message', {
                message: `Đơn hàng ${ipn.order_id} ${ipn.message}`,
                orderId: ipn.orderId,
                order_id: ipn.order_id,
                type: 'paymented',
            });
            res.status(200).json({
                errorCode: 0,
                message: 'success',
            });
        }),
    );

    app.post('/socket/send', async (req, res) => {
        const { store_id, message, type, orderId, order_id } = req.body;
        await notifyMessage(store_id, message, type, orderId, order_id);
        io.to(store_id).emit('message', { message, orderId, order_id });
        res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    });

    app.get('/healthcheck', (_req, res) => {
        res.status(200).send('ok');
    });
    app.get('/nfo.txt', (_req, res) => {
        if (fs.existsSync(join(process.cwd(), 'server/nfo.txt'))) {
            const file = createReadStream(join(process.cwd(), 'server/nfo.txt'));
            return file.pipe(res);
        }
        return res.end('');
    });

    app.all('*', (req: Request, res: Response) => {
        return nextHandler(req, res);
    });

    app.use(HandlerExceptions);

    server.listen(port);
});
