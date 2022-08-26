import axios, { AxiosResponse, AxiosError } from 'axios';

interface Props {
    data: unknown;
    url?: string;
}

const FCMPush = ({ data, url = 'https://fcm.googleapis.com/fcm/send' }: Props) => {
    return new Promise((resolve, reject) => {
        return axios({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `key=${process.env.FCM_SERVER_KEY}`,
            },
            url,
            method: 'POST',
            data,
        })
            .then((response: AxiosResponse) => {
                const res = response.data;
                return resolve(res);
            })
            .catch((error: AxiosError) => {
                let message = `[${url}] Error catch FCM Push`;
                if (error.response) {
                    message = JSON.stringify(error.response.data);
                } else if (error.request) {
                    message = `[${url}] Error request  FCM Push`;
                }
                // eslint-disable-next-line prefer-promise-reject-errors
                return reject({
                    errorCode: 500,
                    message,
                });
            });
    });
};

export default FCMPush;
