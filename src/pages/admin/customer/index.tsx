import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getCustomer } from 'reduxStore/customer/actions';
import { CustomerDataResponseType, AdminInfoDataType } from 'api/types';
import { Typography, Table, Avatar, Space, Form, Button, Input } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { parseCookies, setCookie } from 'nookies';
import { ColumnsType } from 'antd/lib/table/interface';
import CustomerModal from 'components/admin/CustomerModal';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;

const columns: (
    onEdit: (customer: CustomerDataResponseType) => void,
    dataLogin?: AdminInfoDataType,
) => ColumnsType<CustomerDataResponseType> = (onEdit, dataLogin) => [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: CustomerDataResponseType) => (
            <Space>
                <Avatar shape="square" src={record.avatar} />
                {dataLogin?.role !== 'ADMIN' || dataLogin?.permissions?.includes('sales') ? (
                    <div
                        onClick={() =>
                            setCookie(null, 'customerName', record.name, {
                                maxAge: 24 * 60 * 60,
                                path: '/',
                            })
                        }
                    >
                        <Link href={`/admin/sales/orders?customer_id=${record._id}`}>{text}</Link>
                    </div>
                ) : (
                    <span>{text}</span>
                )}
            </Space>
        ),
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phone_number',
        key: 'phone_number',
    },
    {
        title: 'Giới tính',
        dataIndex: 'gender',
        key: 'gender',
        render: (text: string) => <span>{text === 'MALE' ? 'Nam' : text === 'FEMALE' ? 'Nữ' : ''}</span>,
    },
    {
        title: 'Ngày sinh',
        dataIndex: 'birthday',
        key: 'birthday',
        render: (text: string) =>
            `${!text || text === '0' ? 'Chưa cập nhật' : moment(text, 'YYYYMMDD').format('DD/MM/YYYY')}`,
    },
    {
        title: 'Hoạt động gần đây',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm:ss')}</span>,
    },
    {
        title: '',
        key: 'action',
        dataIndex: 'action',
        render: (_text: string, record: CustomerDataResponseType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
            </Space>
        ),
    },
];

const Customer = () => {
    const { group_id, store_id } = parseCookies();
    const dispatch = useDispatch();

    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    const {
        result: { data, total },
        loading,
    } = useSelector((state: ApplicationState) => state.customer);

    const [form] = Form.useForm();

    const [currentPagination, setCurrentPagination] = useState<number>(1);

    const [phoneNumber, setPhoneNumber] = useState('');

    const [isShowModal, setIsShowModal] = useState(false);

    const handleModal = () => {
        setIsShowModal((prevShowModal) => !prevShowModal);
    };

    const [updateCustomer, setUpdateCustomer] = useState<CustomerDataResponseType | null>(null);

    const onEdit = (customer: CustomerDataResponseType) => {
        setIsShowModal(true);
        setUpdateCustomer(customer);
    };

    useEffect(() => {
        dispatch(getCustomer({ group_id, store_id }));
    }, []);

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) {
            setUpdateCustomer(null);
        }
    }, [isShowModal]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Quản lý khách hàng
                    </Title>
                    <Button onClick={handleModal} type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </Space>
                <Search
                    placeholder="Tìm theo số điện thoại"
                    onSearch={(value) => {
                        setPhoneNumber(value);
                        setCurrentPagination(1);
                        dispatch(
                            getCustomer({
                                group_id,
                                store_id,
                                offset: 0,
                                phone_number: value,
                            }),
                        );
                    }}
                    allowClear
                />
                <Table
                    loading={loading}
                    size="small"
                    columns={columns(onEdit, dataLogin)}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{
                        current: currentPagination,
                        total,
                        showSizeChanger: false,
                        showTotal: (total) => {
                            return `Tổng ${total}`;
                        },
                        onChange: async (page) => {
                            setCurrentPagination(page);
                            dispatch(
                                getCustomer({
                                    group_id,
                                    store_id,
                                    offset: (page - 1) * 10,
                                    ...(phoneNumber ? { phone_number: phoneNumber } : null),
                                }),
                            );
                        },
                    }}
                />
            </Space>
            <CustomerModal
                isShowModal={isShowModal}
                handleModal={handleModal}
                updateCustomer={updateCustomer}
                setIsShowModal={setIsShowModal}
                currentPagination={currentPagination}
            />
        </div>
    );
};

export default Customer;
