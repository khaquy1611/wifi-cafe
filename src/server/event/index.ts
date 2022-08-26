import crypto from 'crypto';
import { Socket, Server } from 'socket.io';
import { SubDepartment } from '@smodel/index';
import { notifyMessage } from '@sservice/index';

export default (io: Server, socket: Socket) => {
    const requestOrder = async ({ room = '', table = '', request = '', action = '', icon = '' }) => {
        socket.join(room);
        if (action) {
            await SubDepartment.findByIdAndUpdate(table, { request: action });
            await notifyMessage(room, request, icon);
            socket.broadcast.to(room).emit('message', { message: request });
        }
    };

    const notifyOrder = async ({ room = '', message = '', icon = '', orderId = '', order_id = '' }) => {
        await notifyMessage(room, message, icon, orderId, order_id);
        socket.broadcast.to(room).emit('message', { message, orderId, order_id });
    };

    socket.on('requestOrder', requestOrder);
    socket.on('notifyOrder', notifyOrder);
    socket.on('cookieOrder', ({ id, data = '123abc' }) => {
        let socketId = socket.id;
        if (id) {
            socketId = id;
        }
        io.to(socketId).emit(
            'cookie_order',
            crypto
                .createHmac('sha256', process.env.SECRET_ORDER as string)
                .update(data)
                .digest('hex'),
        );
    });
};
