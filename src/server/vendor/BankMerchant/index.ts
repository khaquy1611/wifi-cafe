import axios, { AxiosError, AxiosResponse } from 'axios';

export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT';

interface IParamBank {
    url: string;
    method: Method;
    data?: any;
    token: string;
}

const BankMerchant = ({ url, method, data, token }: IParamBank) => {
    return new Promise((resolve, reject) => {
        return axios({
            headers: {
                'X-APPOTAPAY-AUTH': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            url,
            method,
            data,
        })
            .then((response: AxiosResponse) => {
                const res = response.data;
                if (res.errorCode !== 0) return reject(res);
                return resolve(res);
            })
            .catch((error: AxiosError) => {
                let res_err = {
                    errorCode: 500,
                    message: JSON.stringify(error.message),
                };
                if (error.response) {
                    res_err = error.response.data;
                } else if (error.request) {
                    res_err = {
                        errorCode: 500,
                        message: 'Error API Bank Merchant',
                    };
                }
                return reject(res_err);
            });
    });
};

export default BankMerchant;
