import React, { useState, useEffect } from 'react';
import {
    ArrowUpOutlined,
    DeleteOutlined,
    EditOutlined,
    FileImageOutlined,
    InboxOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Checkbox,
    Col,
    Form,
    Image,
    Input,
    InputNumber,
    message as messageAntd,
    Popconfirm,
    Radio,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Upload,
    notification,
    Tooltip,
    Switch,
} from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import { RcFile } from 'antd/lib/upload/interface';
import { createProduct, deleteProduct, getDetailProduct, imPortListProduct, updateProduct } from 'api/store';
import { CategoryDataType, ImageManagerDataType } from 'api/types';
import FileManager from 'components/admin/FileManager';
import Modal from 'components/admin/Modal';
import ModalSearchIngredient from 'components/admin/products/ModalSearchIngredient';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { parseCookies } from 'nookies';
import { useDispatch, useSelector } from 'react-redux';
import { getCategory } from 'reduxStore/category/actions';
import { getProducts } from 'reduxStore/products/actions';
import { ApplicationState } from 'reduxStore/store';
import * as XLSX from 'xlsx';
import ModalAddIngre from 'components/admin/products/ModalAddIngre';

const { Title } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const Index = () => {
    const options = [{ label: 'Best seller', value: 'Best seller' }];

    const dispatch = useDispatch();

    const [form] = Form.useForm();

    const { group_id, store_id } = parseCookies();

    const {
        result: { data: dataProduct },
        loading: productLoading,
    } = useSelector((state: ApplicationState) => state.products);

    const {
        result: { data: dataCategory },
    } = useSelector((state: ApplicationState) => state.category);

    useEffect(() => {
        dispatch(getProducts(group_id, store_id));
    }, []);

    useEffect(() => {
        dispatch(getCategory(group_id, store_id));
    }, []);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [isShowModalContent, setIsShowModalContent] = useState<boolean>(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [products, setProducts] = useState<CategoryDataType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [radioValue, setRadioValue] = useState('item');
    const [valueIngredient, setValueIngredient] = useState<string>('');
    const [isModalSearch, setIsModalSearch] = useState(false);
    const [linkWareHouse, setLinkWareHouse] = useState<any>([]);
    const [inputAmountSelect, setInputAmountSelect] = useState();
    const [visibleAddIngre, setVisibleAddIngre] = useState(false);
    const [detailRecord, setDetailRecord] = useState<any>();
    const [valueSwitch, setValueSwitch] = useState<boolean>(false);

    const columns: (
        onEdit: (product: CategoryDataType) => void,
        onDelete: (category: CategoryDataType) => void,
    ) => ColumnsType<CategoryDataType> = (onEdit, onDelete) => [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: CategoryDataType) => (
                <Space>
                    <Avatar shape="square" src={record.logo} />
                    <span>{text}</span>
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
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            sorter: (a: CategoryDataType, b: CategoryDataType) => a.price - b.price,
            render: (text: number) => <span>{text.toLocaleString('en-AU')}</span>,
        },
        {
            title: 'Thứ tự hiển thị',
            dataIndex: 'order',
            key: 'order',
            sorter: (a: CategoryDataType, b: CategoryDataType) => (a.order as number) - (b.order as number),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <Tag color={text === 'available' ? 'green' : 'red'}>{text === 'available' ? 'Có sẵn' : 'Tạm hết'}</Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            responsive: ['xl'],
            render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            title: '',
            key: 'action',
            dataIndex: 'action',
            render: (_text: string, record: CategoryDataType) => (
                <Space>
                    <Button
                        onClick={async () => {
                            const data = await getDetailProduct({ id: record._id, group_id, store_id });
                            setDetailRecord(data?.data);
                            setLinkWareHouse(data?.data?.link_warehouse || []);
                            onEdit(record);
                            form.setFieldsValue({
                                amount: data?.data?.amount,
                                min_amount: data?.data?.min_amount,
                            });
                            setValueSwitch(data?.data?.type_warehouse !== 'off');
                            setRadioValue(data?.data?.type_warehouse === 'off' ? 'item' : data?.data?.type_warehouse);
                        }}
                        size="small"
                        type="primary"
                        icon={<EditOutlined />}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn chắc chắn muốn xoá sản phẩm?"
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

    useEffect(() => {
        if (valueIngredient) {
            setIsModalSearch(true);
        } else {
            setIsModalSearch(false);
        }
    }, [valueIngredient]);

    const onChangeRadio = ({ target: { value } }: any) => {
        setRadioValue(value);
    };

    const onChangeSwitch = (checked: boolean) => {
        setValueSwitch(checked);
    };

    const handleModal = () => {
        setImageSrc('');
        setIsShowModal(!isShowModal);
        setLinkWareHouse([]);
        setDetailRecord('');
        setValueIngredient('');
        setRadioValue('item');
        setValueSwitch(false);
    };

    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    const handleChooseImage = (image: ImageManagerDataType) => {
        form.setFieldsValue({ logo: image.location });
        setImageSrc(image.location);
        setIsShowModalFile(false);
    };

    const [updateProductState, setUpdateProductState] = useState<CategoryDataType | null>(null);

    const [categoryFilter, setCategoryFilter] = useState('all');

    const dataSource = dataProduct?.filter((item) => {
        if (categoryFilter === 'all') return true;
        return item.category_id === categoryFilter;
    });

    const onEdit = (category: CategoryDataType) => {
        setIsShowModalContent(true);
        setIsShowModal(true);
        setUpdateProductState(category);
        setImageSrc(category.logo);
        form.setFieldsValue({
            name: category.name,
            price: category.price,
            desc: category.desc,
            order: category.order,
            type_warehouse: category.type_warehouse,
            logo: category.logo,
            status: category.status,
        });
    };

    const onDelete = async (category: CategoryDataType) => {
        try {
            await deleteProduct(category._id, group_id, store_id);
            dispatch(getProducts(group_id, store_id));
            messageAntd.success('Xoá thành công!');
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const [price, setPrice] = useState<number>(0);

    const onSubmit = async (values: any) => {
        if (detailRecord?.amount && detailRecord?.min_amount) {
            delete values.amount;
            delete values.min_amount;
        }
        try {
            setLoading(true);
            const convertNewLink = linkWareHouse.map((item: any) => ({ id: item.id, quantity: item.quantity }));
            if (convertNewLink.length >= 1 || radioValue === 'item' || !valueSwitch) {
                if (updateProductState) {
                    await updateProduct(
                        {
                            ...values,
                            price,
                            group_id,
                            store_id,
                            ...(radioValue === 'ingredient' && valueSwitch ? { link_warehouse: convertNewLink } : {}),
                            ...(valueSwitch ? { type_warehouse: radioValue } : { type_warehouse: 'off' }),
                        },
                        updateProductState._id,
                    );
                } else {
                    await createProduct({
                        ...values,
                        price,
                        group_id,
                        store_id,
                        ...(radioValue === 'ingredient' && valueSwitch ? { link_warehouse: convertNewLink } : {}),
                        ...(valueSwitch ? { type_warehouse: radioValue } : { type_warehouse: 'off' }),
                    });
                }
                dispatch(getProducts(group_id, store_id));
                setIsShowModal(false);
                messageAntd.success(updateProductState ? 'Sửa thành công!' : 'Thêm mới thành công!');
            } else if (radioValue === 'ingredient' && convertNewLink.length < 1 && valueSwitch) {
                notification.error({ message: 'Vui lòng chọn liên kết ít nhất 1 nguyên liệu' });
            } else {
                notification.error({ message: 'Vui lòng chọn liên kết ít nhất 1 nguyên liệu' });
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    const submitProduct = async () => {
        try {
            if (products.length === 0) {
                messageAntd.warn('Danh sách sản phẩm trống');
                return;
            }
            setLoading(true);
            await imPortListProduct({ products, group_id, store_id });
            dispatch(getProducts(group_id, store_id));
            setIsShowModal(false);
            setLoading(false);
            messageAntd.success('Thêm mới bằng file excel thành công!');
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) {
            setUpdateProductState(null);
            setProducts([]);
        }
    }, [isShowModal]);

    const onChangeAmountLink = (value: any) => {
        const newLinkWareHouse = linkWareHouse.map((item: any) =>
            item._id === inputAmountSelect ? { ...item, quantity: value } : item,
        );
        setLinkWareHouse(newLinkWareHouse);
    };

    const renderFormItemLinkedWareHouse = () => {
        if (radioValue === 'item') {
            return (
                <>
                    <Col span={12} />
                    <Col span={12}>
                        <Form.Item
                            label="Số lượng"
                            name="amount"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                        >
                            <InputNumber style={{ width: '100%' }} disabled={detailRecord?.amount && true} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Số lượng tối thiểu"
                            name="min_amount"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng tối thiểu' }]}
                        >
                            <InputNumber style={{ width: '100%' }} disabled={detailRecord?.min_amount && true} />
                        </Form.Item>
                    </Col>
                </>
            );
        }
        return (
            <Col span={24}>
                <Input
                    placeholder="Tìm nguyên liệu"
                    value={valueIngredient}
                    onChange={(e) => {
                        setValueIngredient(e.target.value);
                    }}
                    style={{ marginBottom: '24px' }}
                    prefix={<SearchOutlined />}
                />

                {linkWareHouse?.length !== 0 &&
                    linkWareHouse?.map((item: any) => {
                        return (
                            <Row gutter={[12, 12]} key={item?._id} align="middle">
                                <Col span={6}>{item?.name}</Col>
                                <Col span={8}>
                                    <InputNumber
                                        onFocus={() => setInputAmountSelect(item?._id)}
                                        onChange={(value) => {
                                            onChangeAmountLink(value);
                                        }}
                                        style={{ width: '100%' }}
                                        placeholder="Nhập số lượng"
                                        required
                                        defaultValue={item?.quantity}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Input disabled value={item?.unit} />
                                </Col>
                                <Col span={2}>
                                    <Tooltip title="Xóa">
                                        <DeleteOutlined
                                            onClick={() => {
                                                setLinkWareHouse(
                                                    linkWareHouse.filter((record: any) => record?.name !== item?.name),
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                </Col>
                            </Row>
                        );
                    })}
                <Button
                    type="link"
                    onClick={() => setVisibleAddIngre(true)}
                    icon={<PlusOutlined />}
                    style={{ marginBottom: '10px' }}
                >
                    Thêm nguyên liệu mới
                </Button>
            </Col>
        );
    };

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Sản phẩm
                    </Title>
                    <Button
                        onClick={() => {
                            handleModal();
                            setIsShowModalContent(true);
                        }}
                        className="float-right"
                        type="primary"
                        icon={<PlusOutlined />}
                    >
                        Thêm mới
                    </Button>
                    <Button
                        onClick={() => {
                            handleModal();
                            setIsShowModalContent(false);
                        }}
                        className="float-right"
                        type="primary"
                        style={{ marginRight: '20px' }}
                        icon={<ArrowUpOutlined />}
                    >
                        Thêm mới bằng file excel
                    </Button>
                </Space>
                <Row gutter={[6, 6]} style={{ clear: 'both' }}>
                    <Col xs={12} sm={12} md={12} lg={6} xl={6}>
                        <Select
                            value={categoryFilter}
                            onChange={(value) => {
                                setCategoryFilter(value);
                            }}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả sản phẩm</Option>
                            {dataCategory?.map((item) => (
                                <Option key={item._id} value={item._id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Space>
            <Table
                size="small"
                columns={columns(onEdit, onDelete)}
                dataSource={dataSource}
                rowKey="_id"
                loading={productLoading}
                pagination={{
                    showSizeChanger: true,
                    showTotal: (total) => {
                        return `Tổng ${total}`;
                    },
                }}
            />
            <Modal isShowModal={isShowModal} hideModal={handleModal}>
                {isShowModalContent ? (
                    <Form
                        form={form}
                        name="basic"
                        layout="vertical"
                        onFinish={onSubmit}
                        initialValues={
                            updateProductState || {
                                price: 0,
                                status: 'available',
                                category_id: dataCategory && !isEmpty(dataCategory) ? dataCategory[0]._id : '',
                                order: 1,
                            }
                        }
                    >
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item
                                    label="Mã sản phẩm"
                                    name="id"
                                    tooltip="Mã định danh cho sản phẩm, các mã sản phẩm không được giống nhau"
                                >
                                    <Input placeholder="Ví dụ: SP0150" />
                                </Form.Item>
                                <Form.Item label="Tên sản phẩm" name="name" required>
                                    <Input required />
                                </Form.Item>
                                <Form.Item label="Giá (đơn vị VNĐ)" name="price" required>
                                    <InputNumber
                                        formatter={(value) => {
                                            setPrice(Number(value));
                                            return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                        }}
                                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') || ''}
                                        min={0}
                                        style={{ width: '100%' }}
                                        required
                                    />
                                </Form.Item>
                                <Form.Item label="Mô tả" name="desc">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Trạng thái sản phẩm" name="status" required>
                                    <Select style={{ width: '100%' }}>
                                        <Option value="available">Còn sẵn</Option>
                                        <Option value="unavailable">Tạm hết</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Danh mục" name="category_id" required>
                                    <Select style={{ width: '100%' }}>
                                        {dataCategory?.map((item) => (
                                            <Option key={item._id} value={item._id}>
                                                {item.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Thứ tự hiển thị"
                                    name="order"
                                    tooltip="Thự tự hiển thị vị trí của sản phẩm ở trang khách đặt món"
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
                                <Form.Item label="Nhãn sản phẩm" name="tags">
                                    <Checkbox.Group options={options} />
                                </Form.Item>
                                <Form.Item label="Ảnh sản phẩm" required>
                                    <Form.Item name="logo" noStyle>
                                        <Input type="hidden" />
                                    </Form.Item>
                                    {imageSrc && (
                                        <Image
                                            preview={false}
                                            style={{ maxWidth: 120, marginRight: 48 }}
                                            src={imageSrc}
                                        />
                                    )}
                                    <Button onClick={handleModalFile} icon={<FileImageOutlined />}>
                                        Chọn ảnh
                                    </Button>
                                </Form.Item>
                            </Col>
                            <Col span={12} style={{ marginBottom: '24px' }}>
                                <div>
                                    <span style={{ marginRight: '8px' }}>Liên kết kho hàng</span>
                                    <Switch checked={valueSwitch} onChange={onChangeSwitch} />
                                </div>
                                {valueSwitch && (
                                    <Radio.Group value={radioValue} onChange={onChangeRadio}>
                                        <Radio value="item">Quản lý mặt hàng</Radio>
                                        <Radio value="ingredient">Quản lý nguyên liệu</Radio>
                                    </Radio.Group>
                                )}
                            </Col>
                            {valueSwitch && renderFormItemLinkedWareHouse()}
                        </Row>
                        <Button block type="primary" htmlType="submit" loading={loading}>
                            Lưu
                        </Button>
                    </Form>
                ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <p>Tải file excel lên</p>
                        <Dragger
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            beforeUpload={(file: RcFile) => {
                                return new Promise(() => {
                                    const reader: FileReader = new FileReader();
                                    reader.readAsArrayBuffer(file);
                                    reader.onload = () => {
                                        const bufferArray = reader.result;
                                        const wb = XLSX.read(bufferArray, { type: 'buffer' });
                                        const wsname = wb.SheetNames[0];
                                        const ws = wb.Sheets[wsname];
                                        const data: CategoryDataType[] = XLSX.utils.sheet_to_json(ws);
                                        setProducts(data);
                                    };
                                });
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo hoặc upload file excel tại đây</p>
                        </Dragger>
                        <Button block type="primary" onClick={submitProduct} loading={loading}>
                            Lưu
                        </Button>
                    </Space>
                )}
            </Modal>
            <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
            {valueIngredient && (
                <ModalSearchIngredient
                    isModalSearch={isModalSearch}
                    setIsModalSearch={setIsModalSearch}
                    valueIngredient={valueIngredient}
                    setValueIngredient={setValueIngredient}
                    setLinkWareHouse={setLinkWareHouse}
                    linkWareHouse={linkWareHouse}
                />
            )}
            <ModalAddIngre
                isModalVisible={visibleAddIngre}
                setIsModalVisible={setVisibleAddIngre}
                setLinkWareHouse={setLinkWareHouse}
                linkWareHouse={linkWareHouse}
            />
        </div>
    );
};

export default Index;
