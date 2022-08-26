import { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';

const useSocket = (fn?: () => void) => {
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const socketIo = socketIO('', {
            transports: ['websocket'],
            forceNew: true,
        });

        setSocket(socketIo);

        if (fn) fn();

        return () => {
            socketIo.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;
