import axios from 'axios';

export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT';
interface IDataMessage {
    token?: string;
    title?: string;
    body?: string;
    message?: string;
}

interface IParamMessage {
    workspace_id: string;
    is_hrm: boolean;
    data: IDataMessage;
}

export default ({ data, is_hrm, workspace_id }: IParamMessage) => {
    if (is_hrm) {
        return axios({
            headers: {
                'x-api-key': process.env.KEY_ACHECKIN_MINIAPP,
                'Content-Type': 'application/json',
            },
            url: process.env.URL_NOTIFY_ACHECKIN_MINIAPP,
            method: 'POST',
            data,
        });
    }
    return axios({
        headers: {
            host: workspace_id,
            'Content-Type': 'application/json',
        },
        url: `https://${workspace_id}/api/http/application/push-message`,
        method: 'POST',
        data,
    });
};
