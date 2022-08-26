import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CustomError from 'pages/_error';
import { useDispatch, useSelector } from 'react-redux';
import wrapper from 'reduxStore';
import { ApplicationState } from 'reduxStore/store';
import { getGroupStores, getGroupStoresSuccess } from 'reduxStore/groupStores/actions';
import { getGroupShops, getGroupShopsSuccess } from 'reduxStore/groupShops/actions';
import chooseGroupID from 'reduxStore/groupIDState/actions';
import { GroupStoresType } from 'reduxStore/groupStores/types';
import { loginSuccess, loginError, login } from 'reduxStore/login/actions';
import { LoginType } from 'reduxStore/login/types';
import { createGroupStore, createGroupShop } from 'api/store';
import { detectLocationID } from 'reduxStore/bookingProducts/actions';
import { ErrorType, CreateGroupShopType } from 'api/types';
import { Steps, Row, Col, Popover, Input, Typography, Form, Spin, Badge, message as messageAntd } from 'antd';
import { setCookie, parseCookies } from 'nookies';
import { isEmpty } from 'lodash';
import { availableLinks } from 'common';

const { Step } = Steps;
const { Text } = Typography;

const steps = [
    {
        title: 'Chuỗi',
    },
    {
        title: 'Cửa hàng',
    },
];

interface PropsType {
    adminInfo: LoginType;
    groupStores: GroupStoresType;
    error: ErrorType;
}

const Overview = (props: PropsType) => {
    const {
        adminInfo: { result: serverAdminInfoResult },
        groupStores: {
            result: { data: serverData },
        },
        error: { errorCode, message } = {},
    } = props;

    if (errorCode) {
        return <CustomError message={message} />;
    }

    const router = useRouter();
    const dispatch = useDispatch();

    const {
        result: { data: loginData },
    } = useSelector((state: ApplicationState) => state.login);

    const {
        result: { data: dataGroupStores },
        loading,
    } = useSelector((state: ApplicationState) => state.groupStores);

    const {
        result: { data: dataGroupShops },
    } = useSelector((state: ApplicationState) => state.groupShops);

    const [currentStep, setCurrentStep] = useState<number>(0);

    const [groupIDState, setGroupIDState] = useState<string>('');

    const [groupWSState, setGroupWState] = useState<string>('');

    const onChangeStep = (current: number) => {
        if (groupIDState) setCurrentStep(current);
    };

    const [visible, setVisible] = useState<boolean>(false);

    const handleVisibleChange = (show: boolean) => {
        setVisible(show);
    };

    const [form] = Form.useForm();
    const onSubmit = async (values: CreateGroupShopType) => {
        try {
            if (!currentStep) {
                await createGroupStore(values);
                dispatch(getGroupStores());
                setVisible(false);
                form.resetFields();
                messageAntd.success('Khởi tạo chuỗi mới thành công!');
            } else {
                values.lat = 21.036966037198763;
                values.long = 105.78232498381716;
                await createGroupShop({ ...values, group_id: groupIDState });
                dispatch(getGroupShops(groupIDState));
                setVisible(false);
                form.resetFields();
                messageAntd.success('Khởi tạo cửa hàng mới thành công!');
            }
        } catch (err) {
            messageAntd.error(err.message);
        }
    };

    const onHandleGroupID = (item: CreateGroupShopType) => {
        setGroupIDState(item._id);
        setGroupWState(item.workspace_id);
        dispatch(getGroupShops(item._id));
        setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
    };

    const onHandleShopID = async (item: CreateGroupShopType) => {
        try {
            messageAntd.loading(`Đang vào cửa hàng ${item.name}`);
            setCookie(null, 'group_id', groupIDState, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });
            setCookie(null, 'store_id', item._id, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });

            setCookie(null, 'group_ws', groupWSState, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });

            dispatch(chooseGroupID({ group_id: groupIDState, store_id: item._id }));
            dispatch(detectLocationID(item._id));
            // window.location.replace(availableLinks(loginData));
            router.push(availableLinks(loginData));
        } catch (err) {
            messageAntd.error(err.message);
            dispatch(loginError(err.message));
        }
    };

    useEffect(() => {
        if (serverData?.length === 1) {
            onHandleGroupID(serverData[0]);
        }
        dispatch(getGroupShopsSuccess({}));
        dispatch(getGroupStoresSuccess({ errorCode, message, data: serverData }));
        dispatch(loginSuccess(serverAdminInfoResult));
    }, []);

    useEffect(() => {
        if (currentStep === 1 && dataGroupShops?.length === 1) {
            onHandleShopID(dataGroupShops[0]);
        }
    }, [currentStep, dataGroupShops]);

    return (
        <div className="web-admin-result-sidebar login-page" style={{ margin: '0 24px' }}>
            <div style={{ backgroundColor: '#fff', width: '80%' }}>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Steps
                            type="navigation"
                            size="small"
                            onChange={onChangeStep}
                            style={{ padding: 10 }}
                            current={currentStep}
                        >
                            {steps.map((item) => (
                                <Step key={item.title} title={item.title} />
                            ))}
                        </Steps>
                        <div style={{ padding: 48 }}>
                            <div style={{ marginBottom: 48 }}>
                                <Image src="/logo.svg" width={192} height={36} />
                                {loginData?.role === 'SUPER_ADMIN' && Boolean(!currentStep) && (
                                    <p style={{ marginTop: 12 }}>
                                        Chọn chuỗi cửa hàng đăng nhập hoặc{' '}
                                        <Popover
                                            content={
                                                <Form form={form} onFinish={onSubmit}>
                                                    <Form.Item name="name" style={{ marginBottom: 0 }}>
                                                        <Input autoComplete="off" required placeholder="Tên chuỗi" />
                                                    </Form.Item>
                                                </Form>
                                            }
                                            trigger="click"
                                            visible={visible}
                                            onVisibleChange={handleVisibleChange}
                                        >
                                            <Text type="success" underline style={{ cursor: 'pointer' }}>
                                                khởi tạo
                                            </Text>
                                        </Popover>{' '}
                                        chuỗi mới
                                    </p>
                                )}
                                {loginData?.role !== 'ADMIN' && Boolean(currentStep) && (
                                    <p style={{ marginTop: 12 }}>
                                        Chọn cửa hàng đăng nhập hoặc{' '}
                                        <Popover
                                            content={
                                                <Form form={form} onFinish={onSubmit}>
                                                    <Form.Item name="name" style={{ marginBottom: 0 }}>
                                                        <Input autoComplete="off" required placeholder="Tên cửa hàng" />
                                                    </Form.Item>
                                                </Form>
                                            }
                                            trigger="click"
                                            visible={visible}
                                            onVisibleChange={handleVisibleChange}
                                        >
                                            <Text type="success" underline style={{ cursor: 'pointer' }}>
                                                khởi tạo
                                            </Text>
                                        </Popover>{' '}
                                        cửa hàng mới
                                    </p>
                                )}
                            </div>
                            <Row gutter={[24, 24]}>
                                {(!currentStep
                                    ? isEmpty(dataGroupStores)
                                        ? serverData
                                        : dataGroupStores
                                    : dataGroupShops
                                )?.map((item) => (
                                    <Col xs={12} sm={12} md={12} lg={12} xl={8} key={item._id}>
                                        <Spin spinning={loading}>
                                            <div
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (!currentStep) {
                                                        onHandleGroupID(item);
                                                    } else {
                                                        onHandleShopID(item);
                                                    }
                                                }}
                                            >
                                                <p>
                                                    <Image
                                                        width={64}
                                                        height={64}
                                                        quality={100}
                                                        objectFit="cover"
                                                        src={item.logo as string}
                                                    />
                                                </p>
                                                <div>
                                                    <Badge status={item.active ? 'success' : 'error'} />
                                                    {item.name}
                                                </div>
                                            </div>
                                        </Spin>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className="login-col">
                        <Image
                            layout="fill"
                            objectFit="cover"
                            quality={100}
                            src="https://s3.kstorage.vn/qrpayment/common/bg_coffee.jpeg"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const { store } = context;

    const { admin_id, tokenqr } = parseCookies(context);

    await store.dispatch(login(admin_id, tokenqr));
    await store.dispatch(getGroupStores(tokenqr));

    const {
        error: { errorCode: errorCodeLogin },
        error: errorLogin,
    } = store.getState().login;

    const {
        error: { errorCode: errorCodeGroupStores },
        error: errorGroupStores,
    } = store.getState().groupStores;

    if (errorCodeLogin === 4030 || errorCodeGroupStores === 4030) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            adminInfo: store.getState().login,
            groupStores: store.getState().groupStores,
            error: { ...errorLogin, ...errorGroupStores },
        },
    };
});

export default Overview;
