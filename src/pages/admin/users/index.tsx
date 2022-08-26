import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getAdminUsers } from 'reduxStore/adminUsers/actions';
import { getGroupShopsSuccess } from 'reduxStore/groupShops/actions';
import { login } from 'reduxStore/login/actions';
import { createAdminUserApi, updateAdminUserApi, deleteAdminUserApi } from 'api/admin';
import { AdminUsersDataType, LoginDataType, ImageManagerDataType } from 'api/types';
import {
    Typography,
    Table,
    Button,
    Form,
    Input,
    Row,
    Col,
    Switch,
    Checkbox,
    Select,
    Space,
    Popconfirm,
    message as messageAntd,
    Tag,
    Avatar,
} from 'antd';
import { PlusOutlined, FileImageOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import FileManager from 'components/admin/FileManager';
import ChangePassword from 'components/admin/common/ChangePassword';
import { parseCookies } from 'nookies';
import { find } from 'lodash';
import moment from 'moment';
import { listPermissions } from 'common';
import { ColumnsType } from 'antd/lib/table/interface';
import Link from 'next/link';

const { Title } = Typography;
const CheckboxGroup = Checkbox.Group;
const { Option } = Select;

const columns: (
    onEdit: (user: AdminUsersDataType) => void,
    onDelete: (user: AdminUsersDataType) => void,
    onChangePassword: (user: AdminUsersDataType) => void,
    loginData?: LoginDataType,
) => ColumnsType<AdminUsersDataType> = (onEdit, onDelete, onChangePassword, loginData) => [
    {
        title: 'Họ và tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: AdminUsersDataType) => (
            <Space>
                <Avatar shape="square" src={record.avatar} />
                <Link href={`/admin/profile?id=${record._id}`}>
                    <a>{text}</a>
                </Link>
                <span>{!record.active && <Tag color="red">Tạm khoá</Tag>}</span>
            </Space>
        ),
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        responsive: ['xl'],
    },
    {
        title: 'Phân quyền',
        dataIndex: 'role',
        key: 'role',
        sorter: (a: { role: string }, b: { role: string }) => a.role.length - b.role.length,
        render: (text: string) => <Tag color={text === 'SUPER_ADMIN' ? 'red' : 'green'}>{text}</Tag>,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        responsive: ['xl'],
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
        title: 'Login gần đây',
        dataIndex: 'loginAt',
        key: 'loginAt',
        sorter: (a: AdminUsersDataType, b: AdminUsersDataType) => b.loginAt - a.loginAt,
        render: (text: number) => <span>{text && moment.unix(text).fromNow()}</span>,
    },
    {
        title: '',
        key: 'action',
        dataIndex: 'action',
        render: (_text: string, record: AdminUsersDataType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
                <Button onClick={() => onChangePassword(record)} size="small" type="primary" icon={<ToolOutlined />}>
                    Đổi mật khẩu
                </Button>
                {loginData?.email !== record.email && (
                    <Popconfirm
                        title="Bạn chắc chắn muốn xoá quản trị viên này?"
                        okText="Có"
                        cancelText="Không"
                        onConfirm={() => onDelete(record)}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>
                            Xoá
                        </Button>
                    </Popconfirm>
                )}
            </Space>
        ),
    },
];

const Users = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [formPass] = Form.useForm();

    const { admin_id, group_id } = parseCookies();

    const {
        result: { data: loginData },
    } = useSelector((state: ApplicationState) => state.login);

    const {
        result: { data: dataAdminUser },
        loading,
    } = useSelector((state: ApplicationState) => state.adminUsers);

    const {
        result: { data: dataGroupShops },
    } = useSelector((state: ApplicationState) => state.groupShops);

    useEffect(() => {
        dispatch(getGroupShopsSuccess({}));
    }, []);
    useEffect(() => {
        dispatch(getAdminUsers(group_id));
    }, []);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [isShowModalPassword, setIsShowModalPassword] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    const handleChooseImage = (image: ImageManagerDataType) => {
        form.setFieldsValue({ avatar: image.location });
        setImageSrc(image.location);
        setIsShowModalFile(false);
    };

    const [roleState, setRoleState] = useState<'SUPER_ADMIN' | 'GROUP_ADMIN' | 'ADMIN'>('SUPER_ADMIN');

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const handleModal = () => {
        setImageSrc('');
        setIsShowModal(!isShowModal);
    };
    const handleModalPassword = () => {
        setIsShowModalPassword(!isShowModalPassword);
    };

    const [adminUser, setAdminUser] = useState<AdminUsersDataType | null>(null);

    const onEdit = (user: AdminUsersDataType) => {
        setIsShowModal(true);
        setAdminUser(user);
        setRoleState(user.role);
        setImageSrc(user.avatar);
    };

    const onChangePassword = (user: AdminUsersDataType) => {
        setAdminUser(user);
        setIsShowModalPassword(true);
    };

    const onDelete = async (user: AdminUsersDataType) => {
        try {
            messageAntd.loading(`Đang xoá quản trị viên ${user.name}`);
            await deleteAdminUserApi(group_id, user._id);
            dispatch(getAdminUsers(group_id));
            messageAntd.success('Xoá thành công!');
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const onSubmit = async (values: AdminUsersDataType) => {
        try {
            const dataPermissions: string[][] = [];
            values.permissions?.forEach((item: string) => {
                const findValue = find(listPermissions(), (o) => {
                    return o.key === item;
                });
                if (findValue) {
                    dataPermissions.push(findValue.value);
                }
            });
            const merged = dataPermissions.flat(1);
            const data = { ...values, role_permissions: merged, group_id };
            setLoadingSubmit(true);
            if (adminUser) {
                await updateAdminUserApi(data, adminUser._id);
            } else {
                await createAdminUserApi(data);
            }
            if (adminUser?._id === loginData?._id) {
                dispatch(login(admin_id));
            }
            dispatch(getAdminUsers(group_id));
            setLoadingSubmit(false);
            setIsShowModal(false);
            messageAntd.success(adminUser ? 'Sửa thành công!' : 'Thêm mới thành công!');
        } catch (err) {
            setLoadingSubmit(false);
            messageAntd.error((err as Error).message);
        }
    };

    const listPermissionsFormated = listPermissions().map((item) => ({
        label: item.label,
        value: item.key,
    }));

    const listShops = dataGroupShops?.map((item) => ({
        label: item.name,
        value: `${item._id}`,
    }));

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) {
            setRoleState('SUPER_ADMIN');
            setAdminUser(null);
        }
    }, [isShowModal]);

    useEffect(() => {
        formPass.resetFields();
    }, [isShowModalPassword]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Quản trị viên
                    </Title>
                    <Button onClick={handleModal} type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </Space>
                <Table
                    loading={loading}
                    size="small"
                    columns={columns(onEdit, onDelete, onChangePassword, loginData)}
                    dataSource={dataAdminUser}
                    rowKey="_id"
                    pagination={{
                        showTotal: (total) => {
                            return `Tổng ${total}`;
                        },
                    }}
                />
            </Space>
            <Modal isShowModal={isShowModal} hideModal={handleModal}>
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={
                        adminUser || {
                            active: true,
                            receive_message_order: true,
                            login_multi_device: true,
                            role: loginData?.role,
                        }
                    }
                    onFinish={onSubmit}
                >
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Họ và tên" name="name" required>
                                <Input required />
                            </Form.Item>
                            <Form.Item label="Email" name="email" required>
                                <Input type="email" required disabled={Boolean(adminUser)} />
                            </Form.Item>
                            {!adminUser && (
                                <Form.Item label="Mật khẩu" name="password" required={!Boolean(adminUser)}>
                                    <Input type="password" required={!Boolean(adminUser)} />
                                </Form.Item>
                            )}
                            <Form.Item label="Avatar">
                                <Form.Item name="avatar" noStyle>
                                    <Input type="hidden" />
                                </Form.Item>
                                <Space size="middle">
                                    {imageSrc && <Avatar size={64} src={imageSrc} />}
                                    <Button size="small" onClick={handleModalFile} icon={<FileImageOutlined />}>
                                        Chọn ảnh
                                    </Button>
                                </Space>
                            </Form.Item>
                            <Form.Item
                                label="Trạng thái"
                                name="active"
                                valuePropName="checked"
                                tooltip="Khoá/mở quản trị viên"
                            >
                                <Switch disabled={adminUser?._id === loginData?._id} />
                            </Form.Item>
                            <Form.Item
                                label="Cho phép đăng nhập trên nhiều thiết bị cùng một thời điểm"
                                name="login_multi_device"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="Nhận thông báo trên app mobile khi khách thanh toán"
                                name="receive_message_order"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Quyền hạn" name="role" required>
                                <Select
                                    style={{ width: '100%' }}
                                    onChange={(value: 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'ADMIN') => {
                                        setRoleState(value);
                                    }}
                                    disabled={adminUser?._id === loginData?._id}
                                >
                                    {loginData?.role === 'SUPER_ADMIN' && (
                                        <Option value="SUPER_ADMIN">SUPER_ADMIN</Option>
                                    )}
                                    <Option value="GROUP_ADMIN">GROUP_ADMIN</Option>
                                    <Option value="ADMIN">ADMIN</Option>
                                </Select>
                            </Form.Item>

                            {roleState === 'ADMIN' && (
                                <>
                                    <div className="form-checkbox">
                                        <Form.Item
                                            label="Cửa hàng"
                                            name="stores"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Chọn cửa hàng quản trị viên này có thể truy cập',
                                                },
                                            ]}
                                            tooltip="Chọn cửa hàng quản trị viên này có thể truy cập"
                                        >
                                            <CheckboxGroup options={listShops} />
                                        </Form.Item>
                                    </div>
                                    <div className="form-checkbox">
                                        <Form.Item
                                            label="Phân quyền"
                                            name="permissions"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Phân quyền truy cập cho quản trị viên này',
                                                },
                                            ]}
                                        >
                                            <CheckboxGroup options={listPermissionsFormated} />
                                        </Form.Item>
                                    </div>
                                </>
                            )}
                        </Col>
                    </Row>
                    <Button loading={loadingSubmit} block type="primary" htmlType="submit">
                        Lưu
                    </Button>
                </Form>
            </Modal>

            <Modal
                title={`Cập nhật ${adminUser?.name}`}
                isShowModal={isShowModalPassword}
                hideModal={handleModalPassword}
            >
                <ChangePassword adminUser={adminUser} setIsShowModalPassword={setIsShowModalPassword} />
            </Modal>
            <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
        </div>
    );
};

export default Users;
