import React, { useState, useEffect } from 'react';
import CustomError from 'pages/_error';
import { useDispatch, useSelector } from 'react-redux';
import wrapper from 'reduxStore';
import { ApplicationState } from 'reduxStore/store';
import { getGroupStores, getGroupStoresSuccess } from 'reduxStore/groupStores/actions';
import { GroupStoresType } from 'reduxStore/groupStores/types';
import { getPaymentMethods, getPaymentMethodsSuccess } from 'reduxStore/paymentMethods/actions';
import { PaymentMethodsType } from 'reduxStore/paymentMethods/types';
import {
    Typography,
    Avatar,
    Space,
    Row,
    Col,
    Button,
    Switch,
    Input,
    Tabs,
    Form,
    Image,
    Result,
    message as messageAntd,
    Checkbox,
    InputNumber,
    Divider,
} from 'antd';
import { updateGroupStore, updatePaymentMethod, setSampleProducts } from 'api/store';
import { ImageManagerDataType, PaymentMethodDataType, ErrorType, CreateGroupShopType } from 'api/types';
import { FileImageOutlined, EditOutlined } from '@ant-design/icons';
import FileManager from 'components/admin/FileManager';
import RevenueManagement from 'components/admin/RevenueManagement';
import Modal from 'components/admin/Modal';
import { parseCookies } from 'nookies';
import { isEmpty } from 'lodash';

const { Title } = Typography;
const { TabPane } = Tabs;

interface PropsType {
    groupStores: GroupStoresType;
    initialValuesServer?: CreateGroupShopType;
    paymentMethods: PaymentMethodsType;
    error: ErrorType;
}

const Config = (props: PropsType) => {
    const {
        groupStores: {
            result: { data: serverDataGroupStores },
        },
        initialValuesServer,
        paymentMethods: {
            result: { data: serverDataPaymentMethods },
        },
        error: { errorCode, message } = {},
    } = props;

    if (errorCode) {
        return <CustomError message={message} />;
    }
    const [formCommon] = Form.useForm();
    const [formPayment] = Form.useForm();
    const dispatch = useDispatch();

    const {
        result: { data: dataGroupStores },
    } = useSelector((state: ApplicationState) => state.groupStores);

    const {
        result: { data: dataPaymentMethods },
    } = useSelector((state: ApplicationState) => state.paymentMethods);

    const { group_id, store_id } = parseCookies();

    const initialValues =
        (isEmpty(dataGroupStores) ? serverDataGroupStores : dataGroupStores)?.find((item) => item._id === group_id) ||
        initialValuesServer;

    const [logoState, setLogoState] = useState<string>('');

    useEffect(() => {
        setLogoState(initialValues?.logo || '');
        dispatch(getGroupStoresSuccess({}));
        dispatch(getPaymentMethodsSuccess({}));
    }, []);

    const [loading, setLoading] = useState<boolean>(false);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [loadingTurnover, setLoadingTurnover] = useState<boolean>(false);
    const handleModal = () => {
        setIsShowModal(!isShowModal);
    };

    const [updatePaymentMethodState, setUpdatePaymentMethodState] = useState<PaymentMethodDataType | null>(null);

    const onEdit = (paymentMethod: PaymentMethodDataType) => {
        setIsShowModal(true);
        setUpdatePaymentMethodState(paymentMethod);
    };

    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    const handleChooseImage = (image: ImageManagerDataType) => {
        formCommon.setFieldsValue({ logo: image.location });
        setLogoState(image.location);
        setIsShowModalFile(false);
    };

    const onSubmitCommon = async (values: CreateGroupShopType) => {
        try {
            setLoading(true);
            await updateGroupStore({ ...values, group_id: `${initialValues?._id}` }, `${initialValues?._id}`);
            dispatch(getGroupStores());
            setLoading(false);
            messageAntd.success('Lưu thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error(err.message);
        }
    };

    const onSubmitPayment = async (values: PaymentMethodDataType) => {
        try {
            const body = {
                order: values.order,
                active: values.active,
                group_id,
                store_id,
            };
            setLoading(true);
            await updatePaymentMethod(body, updatePaymentMethodState?._id || '');
            dispatch(getPaymentMethods(group_id, store_id));
            setIsShowModal(false);
            setLoading(false);
            messageAntd.success('Lưu thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error(err.message);
        }
    };

    const handleInitPaymentMethods = async () => {
        try {
            setLoading(true);
            await setSampleProducts({
                init_product: false,
                init_payment: true,
                init_department: false,
                group_id,
                store_id,
            });
            dispatch(getPaymentMethods(group_id, store_id));
            setLoading(false);
        } catch (err) {
            setLoading(false);
            messageAntd.error(err.message);
        }
    };

    useEffect(() => {
        formPayment.resetFields();
        if (!isShowModal) setUpdatePaymentMethodState(null);
    }, [isShowModal]);
    const paymentMethods = isEmpty(dataPaymentMethods) ? serverDataPaymentMethods : dataPaymentMethods;
    return (
        <div className="site-layout-background">
            <Title level={2}>Cài đặt</Title>
            <Tabs
                defaultActiveKey="1"
                onChange={(e) => {
                    if (e === '3') {
                        setLoadingTurnover(!loadingTurnover);
                    }
                }}
            >
                <TabPane tab="Cài đặt chung" key="1">
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={16} xl={12}>
                            <Form
                                form={formCommon}
                                name="basic"
                                layout="vertical"
                                initialValues={initialValues}
                                onFinish={onSubmitCommon}
                            >
                                <Divider orientation="left">Cấu hình chung</Divider>
                                <Form.Item label="Tên" name="name" required>
                                    <Input required />
                                </Form.Item>
                                <Form.Item label="Mô tả" name="desc">
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    tooltip="Đóng/mở chuỗi cửa hàng"
                                    label="Trạng thái"
                                    name="active"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                                <Form.Item label="Logo">
                                    <Space size="large">
                                        <Image width={200} preview={false} src={logoState} />
                                        <Form.Item name="logo" noStyle>
                                            <Input type="hidden" />
                                        </Form.Item>
                                        <Button onClick={handleModalFile} icon={<FileImageOutlined />}>
                                            Chọn ảnh
                                        </Button>
                                    </Space>
                                </Form.Item>
                                <Button loading={loading} block type="primary" htmlType="submit">
                                    Lưu
                                </Button>
                            </Form>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Phương thức thanh toán" key="2">
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={16} xl={12}>
                            {paymentMethods?.map((item) => (
                                <div key={item._id} className="radio-payment">
                                    <Checkbox disabled={!item.active} checked={item.active}>
                                        <Space align="center" size="middle">
                                            <Avatar
                                                shape="square"
                                                src={`https://s3.kstorage.vn/qrpayment/common/${item.code}.png`}
                                            />
                                            <div>
                                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                <div>{item.desc}</div>
                                            </div>
                                        </Space>
                                    </Checkbox>
                                    <div className="float-right">
                                        <Button
                                            onClick={() => onEdit(item)}
                                            size="small"
                                            type="primary"
                                            icon={<EditOutlined />}
                                            style={{ marginRight: 10 }}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {!paymentMethods?.length && (
                                <Result
                                    icon={
                                        <Image
                                            preview={false}
                                            src="https://s3.kstorage.vn/qrpayment/common/icon_payment_method.png"
                                        />
                                    }
                                    title="Cài đặt phương thức thanh toán"
                                    subTitle="Hệ thống cung cấp các phương thức thanh toán đa dạng các hình thức từ Tiền mặt, Ví Appota đến Thẻ ATM, Visa"
                                    extra={
                                        <Button type="primary" loading={loading} onClick={handleInitPaymentMethods}>
                                            Cài đặt
                                        </Button>
                                    }
                                />
                            )}
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Quản lý doanh thu" key="3">
                    <RevenueManagement loadingTurnover={loadingTurnover} />
                </TabPane>
            </Tabs>
            <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
            <Modal isShowModal={isShowModal} hideModal={handleModal}>
                <Form
                    form={formPayment}
                    name="basic"
                    layout="vertical"
                    onFinish={onSubmitPayment}
                    initialValues={updatePaymentMethodState || {}}
                >
                    <Form.Item
                        label="Thứ tự hiển thị"
                        name="order"
                        tooltip="Thự tự hiển thị vị trí của phương thức thanh toán"
                    >
                        <InputNumber
                            formatter={(value) => {
                                if (Number(value) < 1) return '1';
                                return `${value}`.replace(/\D/, '');
                            }}
                            min={1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="active"
                        valuePropName="checked"
                        tooltip="Đóng/mở phương thức thanh toán"
                    >
                        <Switch />
                    </Form.Item>
                    <Button loading={loading} block type="primary" htmlType="submit">
                        Lưu
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const { store } = context;
    const { tokenqr, group_id, store_id } = parseCookies(context);

    await store.dispatch(getGroupStores(tokenqr));
    await store.dispatch(getPaymentMethods(group_id, store_id, tokenqr));

    const {
        error: { errorCode: errorCodeGroupStores },
        error: errorGroupStores,
    } = store.getState().groupStores;

    const {
        error: { errorCode: errorCodePaymentMethods },
        error: errorPaymentMethods,
    } = store.getState().paymentMethods;

    if (errorCodeGroupStores === 4030 || errorCodePaymentMethods === 4030) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    const initialValuesServer = store.getState().groupStores.result.data?.find((item) => item._id === group_id);

    return {
        props: {
            groupStores: store.getState().groupStores,
            initialValuesServer,
            paymentMethods: store.getState().paymentMethods,
            error: { ...errorGroupStores, ...errorPaymentMethods },
        },
    };
});

export default Config;
