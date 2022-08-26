import Queue from 'bee-queue';

export default (name: string) => {
    const options = {
        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
    };
    const queue = new Queue(name, options);
    return queue;
};
