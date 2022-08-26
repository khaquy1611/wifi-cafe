import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getGroupShops, getGroupShopsSuccess } from 'reduxStore/groupShops/actions';
import {
    Typography,
    Table,
    Space,
    Button,
    Form,
    Input,
    Select,
    Switch,
    message as messageAntd,
    Row,
    Col,
    Avatar,
    Image,
    Divider,
} from 'antd';
import { EditOutlined, PlusOutlined, FileImageOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import FileManager from 'components/admin/FileManager';
import { createGroupShop, updateGroupShop } from 'api/store';
import { CreateGroupShopType, ImageManagerDataType } from 'api/types';
import { isEmpty } from 'lodash';
import { ColumnsType } from 'antd/lib/table/interface';

const { Title } = Typography;

const columns: (onEdit: (store: CreateGroupShopType) => void) => ColumnsType<CreateGroupShopType> = (onEdit) => [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: CreateGroupShopType) => (
            <Space>
                <Avatar shape="square" src={record.logo} />
                <span>{text}</span>
            </Space>
        ),
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        responsive: ['xl'],
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phone_number',
        key: 'phone_number',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'active',
        key: 'active',
        render: (text: string) =>
            text ? (
                <Avatar shape="square" src="https://s3.kstorage.vn/qrpayment/common/open-store.png" />
            ) : (
                <Avatar shape="square" src="https://s3.kstorage.vn/qrpayment/common/close-store.png" />
            ),
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
        title: '',
        key: 'action',
        dataIndex: 'action',
        render: (_text: string, record: CreateGroupShopType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
                {/* <Popconfirm title="Bạn chắc chắn muốn xoá cửa hàng" okText="Đồng ý" cancelText="Huỷ bỏ">
                    <Button danger size="small" icon={<DeleteOutlined />}>
                        Xoá
                    </Button>
                </Popconfirm> */}
            </Space>
        ),
    },
];

const Stores = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { group_id } = useSelector((state: ApplicationState) => state.groupIDState);

    const {
        result: { data },
        loading,
    } = useSelector((state: ApplicationState) => state.groupShops);

    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    useEffect(() => {
        dispatch(getGroupShopsSuccess({}));
    }, []);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [errLat, setErrLat] = useState<boolean>(false);
    const [errLong, setErrLong] = useState<boolean>(false);

    const [updateStore, setUpdateStore] = useState<CreateGroupShopType | null>(null);
    const onEdit = (store: CreateGroupShopType) => {
        setIsShowModal(true);
        setUpdateStore(store);
        setImageSrc(store.logo);
    };

    const isLatitude = (num: number) => Math.abs(num) <= 90;

    const isLongitude = (num: number) => Math.abs(num) <= 180;

    const handleModal = () => {
        setImageSrc('');
        setIsShowModal(!isShowModal);
    };

    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    const handleChooseImage = (image: ImageManagerDataType) => {
        form.setFieldsValue({ logo: image.location });
        setImageSrc(image.location);
        setIsShowModalFile(false);
    };

    const onSubmit = async (values: CreateGroupShopType) => {
        try {
            if (errLong || errLat) {
                messageAntd.error('Toạ độ bạn nhập không chính xác');
                return;
            }
            setLoadingSubmit(true);
            const { api_key, secret_key } = values;
            delete values.api_key;
            delete values.secret_key;
            if (updateStore) {
                await updateGroupShop(
                    {
                        ...values,
                        ...(!isEmpty(api_key) ? { api_key } : {}),
                        ...(!isEmpty(secret_key) ? { secret_key } : {}),
                        group_id,
                        store_id: '',
                    },
                    updateStore._id,
                );
            } else {
                await createGroupShop({
                    ...values,
                    ...(!isEmpty(api_key) ? { api_key } : {}),
                    ...(!isEmpty(secret_key) ? { secret_key } : {}),
                    group_id,
                    store_id: '',
                });
            }
            dispatch(getGroupShops(group_id));
            setIsShowModal(false);
            setLoadingSubmit(false);
            messageAntd.success(updateStore ? 'Sửa thành công!' : 'Thêm mới thành công!');
        } catch (err) {
            setLoadingSubmit(false);
            messageAntd.error((err as Error).message);
        }
    };

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) setUpdateStore(null);
    }, [isShowModal]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Cửa hàng
                    </Title>
                    {dataLogin?.role !== 'ADMIN' && (
                        <Button onClick={handleModal} type="primary" icon={<PlusOutlined />}>
                            Thêm mới
                        </Button>
                    )}
                </Space>
                <Table
                    loading={loading}
                    size="small"
                    columns={columns(onEdit)}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{
                        showTotal: (total) => {
                            return `Tổng ${total}`;
                        },
                    }}
                />
            </Space>
            <Modal isShowModal={isShowModal} hideModal={handleModal} width="100%">
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={
                        updateStore || {
                            active: true,
                            ips: [],
                            order: 1,
                            order_card_table: 30,
                        }
                    }
                    onFinish={onSubmit}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Divider orientation="left">Thông tin chung</Divider>
                            <Form.Item label="Tên" name="name" required>
                                <Input required />
                            </Form.Item>
                            <Form.Item label="Mô tả" name="desc">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Số điện thoại" name="phone_number">
                                <Input type="tel" />
                            </Form.Item>
                            <Form.Item label="Facebook messenger" name="messenger">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Zalo" name="zalo">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Địa chỉ" name="address">
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Latitude"
                                name="lat"
                                required
                                hasFeedback={errLat && true}
                                validateStatus={errLat ? 'error' : 'success'}
                                help={errLat && 'Latitude không chính xác'}
                            >
                                <Input
                                    required
                                    onChange={() => {
                                        setErrLat(false);
                                    }}
                                    onBlur={(e) => {
                                        if (!isLatitude(parseInt(e.target.value, 10))) {
                                            setErrLat(true);
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Longitude"
                                name="long"
                                required
                                hasFeedback={errLong && true}
                                validateStatus={errLong ? 'error' : 'success'}
                                help={errLong && 'Longitude không chính xác'}
                            >
                                <Input
                                    required
                                    onChange={() => {
                                        setErrLong(false);
                                    }}
                                    onBlur={(e) => {
                                        if (!isLongitude(parseInt(e.target.value, 10))) {
                                            setErrLong(true);
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                required
                                label="Thứ tự hiển thị"
                                name="order"
                                tooltip="Thự tự hiển thị vị trí của cửa hàng"
                            >
                                <Input required />
                            </Form.Item>
                            <Form.Item label="Logo">
                                <Form.Item name="logo" noStyle>
                                    <Input type="hidden" />
                                </Form.Item>
                                <Space size="large">
                                    {imageSrc && <Image width={200} preview={false} src={imageSrc} />}
                                    <Button onClick={handleModalFile} icon={<FileImageOutlined />}>
                                        Chọn ảnh
                                    </Button>
                                </Space>
                            </Form.Item>
                            <Form.Item
                                label="Trạng thái"
                                name="active"
                                valuePropName="checked"
                                tooltip="Đóng/mở cửa hàng"
                                required
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Divider orientation="left">Cài đặt khác</Divider>
                            <Form.Item label="Chân trang trên hoá đơn" name="message">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Số lượng thẻ bàn để nhận món" name="order_card_table">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Danh sách IP whitelist" name="ips">
                                <Select mode="tags" options={[]} />
                                <span style={{ color: '#ababab', fontSize: 13 }}>
                                    Nếu nhập, hệ thống chỉ cho phép những IP trên được phép truy cập để đặt món trên
                                    website hoặc app mobile
                                </span>
                            </Form.Item>
                            <Divider orientation="left">Cài đặt thanh toán</Divider>
                            <Image width={200} preview={false} src="https://appota.com/static/media/pay.5b5712d2.png" />
                            <p>
                                Bạn đang chọn thanh toán qua AppotaPay, để tìm hiểu thêm về AppotaPay vui lòng xem{' '}
                                <a href="https://appotapay.com" target="_blank" rel="noreferrer">
                                    tại đây
                                </a>
                            </p>
                            <Form.Item label="PARTNER CODE" name="partner_code">
                                <Input />
                            </Form.Item>
                            <Form.Item label="API KEY" name="api_key">
                                <Input placeholder="************************" />
                            </Form.Item>
                            <Form.Item label="SECRET KEY" name="secret_key">
                                <Input placeholder="************************" />
                            </Form.Item>
                            <Form.Item
                                label="IP"
                                name="ip"
                                rules={[
                                    {
                                        pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                                        message: 'IP không hợp lệ',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button block type="primary" htmlType="submit" loading={loadingSubmit}>
                        Lưu
                    </Button>
                </Form>
            </Modal>
            <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
        </div>
    );
};
export default Stores;
