import React, { useEffect } from 'react';
// import crypto from 'crypto';
// import { sign } from 'jsonwebtoken';
import wrapper from 'reduxStore';
import CustomError from 'pages/_error';
import { useRouter } from 'next/router';
import { getClientStoreInfo } from 'reduxStore/clientStoreInfo/actions';
import { ClientStoreInfoType } from 'reduxStore/clientStoreInfo/types';
import { ErrorType } from 'api/types';
import { Result, Button, Image } from 'antd';
import { setCookie } from 'nookies';

interface PropsType {
    clientStoreInfo: ClientStoreInfoType;
    error: ErrorType;
}

const Welcome = (props: PropsType) => {
    const router = useRouter();
    const {
        clientStoreInfo: {
            result: { data: serverDataClientStoreInfo },
        },
        error: { errorCode, message } = {},
    } = props;

    if (errorCode) {
        return <CustomError message={message} />;
    }

    useEffect(() => {
        if (router.query.q) {
            setCookie(null, 'qrCode', `${router.query.q}`, {
                path: '/',
            });
        }
    }, []);

    return (
        <Result
            icon={
                <Image
                    width="80%"
                    style={{ maxWidth: 350, margin: '0 auto' }}
                    preview={false}
                    src={serverDataClientStoreInfo?.store.logo}
                />
            }
            className="web-admin-result-sidebar page-404"
            status="success"
            title={serverDataClientStoreInfo?.store.name}
            subTitle={
                <div>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>
                        {serverDataClientStoreInfo?.sub_deparment.name} ({serverDataClientStoreInfo?.deparment.name})
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        Tại đây quý khách có thể đặt món hoặc gọi nhân viên đến phục vụ, thanh toán
                    </div>
                </div>
            }
            extra={
                <Button
                    className="btn-border"
                    block
                    size="large"
                    type="primary"
                    onClick={() => router.push(`/product`)}
                >
                    Tiếp tục
                </Button>
            }
        />
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const {
        store,
        query: { q },
    } = context;
    if (!q) {
        return {
            props: {
                clientStoreInfo: store.getState().clientStoreInfo,
                error: { errorCode: 400, message: 'Vui lòng quét mã QR Code để sử dụng dịch vụ tại quán' },
            },
        };
    }
    // const agent = context.req.headers['user-agent'] as string;
    // const A1 = crypto.createHash('md5').update(`${agent}${context.req.headers['x-real-ip']}`).digest('hex');
    // const token = sign(
    //     {
    //         data: A1,
    //     },
    //     process.env.JWT_AUTHORIZATION_SOCKET as string,
    //     { expiresIn: '3h' },
    // );

    // setCookie(context, 'C1', token, {
    //     maxAge: 24 * 60 * 60,
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'strict',
    // });

    await store.dispatch(getClientStoreInfo(typeof q === 'string' ? q : ''));

    const { error: errorClientStoreInfo } = store.getState().clientStoreInfo;

    return {
        props: {
            clientStoreInfo: store.getState().clientStoreInfo,
            error: { ...errorClientStoreInfo },
        },
    };
});

export default Welcome;
