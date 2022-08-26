import map from 'lodash/map';
import { Admin, Store } from '@smodel/index';
import { ROLE_GROUP_ADMIN } from '@sconfig/app';
import { FCMPushType } from '@stypes/index';
import FCMPush from '@svendor/FCMPush';
import logger from '@svendor/Logger';
import configQueue from './config';

export default async (value: FCMPushType) => {
    const statUrlQueue = configQueue('fcmpush');
    const job = await statUrlQueue.createJob(value).save();
    job.on('failed', (err) => {
        logger.error(`fcmpush - Message: ${err.message} - Stack: ${err.stack}`);
    });
    statUrlQueue.process(async (job) => {
        const admin = await Admin.find(
            {
                groupStores: job.data.group_id,
                role: ROLE_GROUP_ADMIN,
                receive_message_order: true,
                active: true,
                device_token: { $exists: true, $ne: '' },
            },
            'device_token',
        );
        if (admin.length) {
            const store = await Store.findById(job.data.store_id);
            if (store) {
                const listToken = map(admin, 'device_token');
                const totalAmount = job.data.total - job.data.discount_amount;
                const dataPush = {
                    registration_ids: listToken,
                    notification: {
                        title: `${store.name} - TT thành công`,
                        body: `Đơn hàng trị giá ${totalAmount.toLocaleString('en-AU')}₫ đã được thanh toán bởi ${
                            job.data.customer_name
                        }`,
                        image: 'https://s3.kstorage.vn/qrpayment/common/payment-push.png',
                    },
                };
                await FCMPush({ data: dataPush });
            }
        }
    });
};
