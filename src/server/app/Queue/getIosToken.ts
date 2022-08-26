/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order, Admin } from '@smodel/index';
import FCMPush from '@svendor/FCMPush';
import logger from '@svendor/Logger';
import configQueue from './config';

export default async (value: { id: string; type: 'order' | 'admin' }) => {
    const statUrlQueue = configQueue('fcmgettokenios');
    const job = await statUrlQueue.createJob(value).save();
    job.on('failed', (err) => {
        logger.error(`fcmgettokenios - Message: ${err.message} - Stack: ${err.stack}`);
    });
    statUrlQueue.process(async (job) => {
        let model: any = Order;
        if (job.data.type === 'admin') {
            model = Admin;
        }
        const data = await model.findById(job.data.id);
        if (data) {
            const dataPush = {
                application: 'bangdev.FreeWifi',
                sandbox: true,
                apns_tokens: [data.deviceToken],
            };

            const token: any = await FCMPush({
                data: dataPush,
                url: 'https://iid.googleapis.com/iid/v1:batchImport',
            });
            if (!token.results || !token.results.length) {
                throw new Error(JSON.stringify(token));
            }
            data.deviceToken = token.results[0].registration_token;
            await data.save();
        }
    });
};
