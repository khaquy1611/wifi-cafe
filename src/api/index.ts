// import { isEmpty } from 'lodash';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { isEmpty } from 'lodash';
import { parseCookies } from 'nookies';

type InputMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Props {
    endpoint: string;
    method: InputMethodType;
    token?: string;
    agent?: string;
    cookie?: string;
    data?: any;
    params?: any;
}

const { tokenqr } = parseCookies();
class Api {
    public callApi = (dataAxios: Props): Promise<any> => {
        return new Promise((resolve, reject) => {
            return axios({
                method: dataAxios.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(!isEmpty(dataAxios.token) || tokenqr ? { Authorization: dataAxios.token || tokenqr } : {}),
                },

                url: `${process.env.API_URL}/${dataAxios.endpoint}`,
                data: dataAxios.data,
                params: dataAxios.params,
                withCredentials: process.env.APP_DEBUG === 'production',
            })
                .then((response: AxiosResponse) => {
                    const res = response.data;
                    if (res.errorCode !== 0) return reject(res);
                    return resolve(res);
                })
                .catch((error: AxiosError) => {
                    let res_err = {
                        errorCode: 400,
                        message: JSON.stringify(error.message),
                    };
                    if (error.response) {
                        res_err = error.response.data;

                        if (typeof window !== 'undefined' && res_err.errorCode === 4030 && dataAxios.token === '') {
                            window.location.href = '/login';
                        }
                    } else if (error.request) {
                        res_err = {
                            errorCode: 400,
                            message: `Không có kết nối internet hoặc máy chủ không phản hồi`,
                        };
                    }
                    return reject(res_err);
                });
        });
    };
}

export default new Api();
