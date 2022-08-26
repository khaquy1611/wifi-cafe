import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getCategory } from 'reduxStore/category/actions';
import { createCategory, updateCategory, deleteCategory } from 'api/store';
import { CategoryDataType, ImageManagerDataType } from 'api/types';
import {
    Typography,
    Table,
    Button,
    Form,
    Input,
    InputNumber,
    Switch,
    Avatar,
    Space,
    Popconfirm,
    message as messageAntd,
    Tag,
} from 'antd';
import { PlusOutlined, FileImageOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import FileManager from 'components/admin/FileManager';
import { parseCookies } from 'nookies';
import moment from 'moment';
import { ColumnsType } from 'antd/lib/table/interface';

const { Title } = Typography;

const columns: (
    onEdit: (category: CategoryDataType) => void,
    onDelete: (category: CategoryDataType) => void,
) => ColumnsType<CategoryDataType> = (onEdit, onDelete) => [
    {
        title: 'Tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: CategoryDataType) => (
            <Space>
                <Image width={32} height={32} quality={100} objectFit="cover" src={record.logo} />
                <span>{text}</span>
                <span>{!record.active && <Tag color="red">Tạm hết</Tag>}</span>
            </Space>
        ),
    },
    {
        title: 'Mô tả',
        dataIndex: 'desc',
        key: 'desc',
        responsive: ['xl'],
    },
    {
        title: 'Thứ tự hiển thị',
        dataIndex: 'order',
        key: 'order',
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
        render: (_text: string, record: CategoryDataType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
                <Popconfirm
                    title="Bạn chắc chắn muốn xoá danh mục?"
                    okText="Có"
                    cancelText="Không"
                    onConfirm={() => onDelete(record)}
                >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                        Xoá
                    </Button>
                </Popconfirm>
            </Space>
        ),
    },
];

const Category = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const { group_id, store_id } = parseCookies();

    const {
        result: { data },
        loading: LoadingCategory,
    } = useSelector((state: ApplicationState) => state.category);

    useEffect(() => {
        dispatch(getCategory(group_id, store_id));
    }, []);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);

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

    const [updateCategoryState, setUpdateCategoryState] = useState<CategoryDataType | null>(null);

    const onEdit = (category: CategoryDataType) => {
        setIsShowModal(true);
        setUpdateCategoryState(category);
        setImageSrc(category.logo);
    };

    const onDelete = async (category: CategoryDataType) => {
        try {
            messageAntd.loading(`Đang xoá danh mục ${category.name}`);
            await deleteCategory(category._id, group_id, store_id);
            dispatch(getCategory(group_id, store_id));
            messageAntd.success('Xoá thành công!');
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const onSubmit = async (values: CategoryDataType) => {
        try {
            setLoading(true);
            if (updateCategoryState) {
                await updateCategory({ ...values, group_id, store_id }, updateCategoryState._id);
            } else {
                await createCategory({ ...values, group_id, store_id });
            }
            dispatch(getCategory(group_id, store_id));
            setIsShowModal(false);
            setLoading(false);
            messageAntd.success(updateCategoryState ? 'Sửa thành công!' : 'Thêm mới thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) setUpdateCategoryState(null);
    }, [isShowModal]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Danh mục sản phẩm
                    </Title>
                    <Button onClick={handleModal} type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                </Space>
                <Table
                    loading={LoadingCategory}
                    size="small"
                    columns={columns(onEdit, onDelete)}
                    dataSource={data}
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
                    onFinish={onSubmit}
                    initialValues={updateCategoryState || { order: 1, active: true }}
                >
                    <Form.Item label="Tên" name="name" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="desc">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Logo">
                        <Form.Item name="logo" noStyle>
                            <Input type="hidden" />
                        </Form.Item>
                        <Space size="middle">
                            {imageSrc && <Avatar size={64} shape="square" src={imageSrc} />}
                            <Button size="small" onClick={handleModalFile} icon={<FileImageOutlined />}>
                                Chọn ảnh
                            </Button>
                        </Space>
                    </Form.Item>
                    <Form.Item
                        label="Thứ tự hiển thị"
                        name="order"
                        tooltip="Thự tự hiển thị vị trí của danh mục ở trang khách đặt món"
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
                    <Form.Item label="Trạng thái" name="active" valuePropName="checked" tooltip="Khoá/mở danh mục">
                        <Switch />
                    </Form.Item>
                    <Button block type="primary" htmlType="submit" loading={loading}>
                        Lưu
                    </Button>
                </Form>
            </Modal>
            <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
        </div>
    );
};

export default Category;
