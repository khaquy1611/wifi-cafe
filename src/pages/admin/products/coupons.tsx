import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomError from 'pages/_error';
import { useDispatch, useSelector } from 'react-redux';
import wrapper from 'reduxStore';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { ApplicationState } from 'reduxStore/store';
import { getProducts } from 'reduxStore/products/actions';
import { PropductsType } from 'reduxStore/products/types';
import { getCoupons } from 'reduxStore/coupons/actions';
import { createCoupon, updateCouponApi } from 'api/store';
import { CouponsDataResponseType, CreateCouponType, AdminInfoDataType, ErrorType, CouponsFormType } from 'api/types';
import {
    Typography,
    Table,
    Button,
    Form,
    Input,
    InputNumber,
    Row,
    Col,
    Select,
    Space,
    DatePicker,
    Avatar,
    Tag,
    message as messageAntd,
} from 'antd';
import { PlusOutlined, EditOutlined, FileExcelOutlined, FilterOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import { parseCookies, setCookie } from 'nookies';
import moment from 'moment';
import { ColumnsType } from 'antd/lib/table/interface';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusText = {
    fixed_cart: 'Giảm tiền trên giỏ hàng',
    percent_cart: 'Giảm % trên giỏ hàng',
    fixed_product: 'Giảm tiền trên sản phẩm',
    percent_product: 'Giảm % trên sản phẩm',
};

const discountTypeOptions = [
    {
        label: 'Giảm tiền trên giỏ hàng',
        value: 'fixed_cart',
    },
    {
        label: 'Giảm % trên giỏ hàng',
        value: 'percent_cart',
    },
    {
        label: 'Giảm tiền trên sản phẩm',
        value: 'fixed_product',
    },
    {
        label: 'Giảm % trên sản phẩm',
        value: 'percent_product',
    },
];

const platformOptions = [
    {
        label: 'Web',
        value: 'web',
    },
    {
        label: 'Miniapp (ACheckin)',
        value: 'miniapp',
    },
    {
        label: 'App Mobile',
        value: 'app',
    },
];

const disabledDate = (current: moment.Moment) => current < moment().subtract(1, 'days').endOf('day');

const columns: (
    onEdit: (coupon: CouponsDataResponseType) => void,
    dataLogin?: AdminInfoDataType,
) => ColumnsType<CouponsDataResponseType> = (onEdit, dataLogin) => [
    {
        title: 'Mã khuyến mãi',
        dataIndex: 'code',
        key: 'code',
        render: (text: string, record: CouponsDataResponseType) => (
            <div
                onClick={() =>
                    setCookie(null, 'couponCode', record.code, {
                        maxAge: 24 * 60 * 60,
                        path: '/',
                    })
                }
            >
                {dataLogin?.role !== 'ADMIN' || dataLogin?.permissions?.includes('sales') ? (
                    <Link href={`/admin/sales/orders?discount_id=${record._id}`}>{text}</Link>
                ) : (
                    <span>{text}</span>
                )}
            </div>
        ),
    },
    {
        title: 'Mô tả',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Loại khuyến mãi',
        dataIndex: 'discount_type',
        key: 'discount_type',
        render: (text: 'fixed_cart' | 'percent_cart' | 'fixed_product' | 'percent_product') => (
            <span>{statusText[text]}</span>
        ),
    },
    {
        title: 'Giá trị',
        dataIndex: 'amount',
        key: 'amount',
        render: (text: number, record: CouponsDataResponseType) => (
            <span>
                {text.toLocaleString('en-AU')}
                {record.discount_type.includes('percent') ? '%' : ' Đ'}
            </span>
        ),
    },
    {
        title: 'Áp dụng trên',
        dataIndex: 'platform',
        key: 'platform',
        render: (text: Array<string>) => <span>{text.join(', ')}</span>,
    },
    {
        title: 'Ngày bắt đầu',
        dataIndex: 'date_start',
        key: 'date_start',
        render: (text: number) => <span>{moment.unix(text).format('DD/MM/YYYY')}</span>,
    },
    {
        title: 'Ngày hết hạn',
        dataIndex: 'date_expires',
        key: 'date_expires',
        render: (text: number) =>
            moment().unix() > text ? (
                <Tag color="#dd4b39">{moment.unix(text).format('DD/MM/YYYY')}</Tag>
            ) : (
                <span>{moment.unix(text).format('DD/MM/YYYY')}</span>
            ),
    },
    {
        title: 'Thời gian áp dụng',
        dataIndex: 'date_start',
        key: 'date_start',
        render: (_text: number, record: CouponsDataResponseType) => (
            <span>
                Từ <b>{moment.unix(record.date_start).format('HH:mm')}</b> đến{' '}
                <b>{moment.unix(record.date_expires).format('HH:mm')}</b>
            </span>
        ),
    },
    {
        title: 'Số lượng sử dụng',
        dataIndex: 'usage_count',
        key: 'usage_count',
        render: (text: number, record: CouponsDataResponseType) => {
            if (text && text === record.usage_limit)
                return (
                    <Tag color="#dd4b39">
                        {text}/{record.usage_limit}
                    </Tag>
                );
            return (
                <span>
                    {text}/{record.usage_limit || 'Không giới hạn'}
                </span>
            );
        },
    },
    {
        title: '',
        key: 'action',
        dataIndex: 'action',
        render: (_text: string, record: CouponsDataResponseType) => (
            <Space>
                <Button onClick={() => onEdit(record)} size="small" type="primary" icon={<EditOutlined />}>
                    Sửa
                </Button>
                {/* <Popconfirm
                    title="Bạn chắc chắn muốn xoá quản trị viên này"
                    okText="Đồng ý"
                    cancelText="Huỷ bỏ"
                    onConfirm={() => onDelete(record)}
                >
                    <Button danger size="small" icon={<DeleteOutlined />}>
                        Xoá
                    </Button>
                </Popconfirm> */}
            </Space>
        ),
    },
];

interface PropsType {
    products: PropductsType;
    error: ErrorType;
}

const Coupons = (props: PropsType) => {
    const {
        products: {
            result: { data: serverDataProducts },
        },
        error: { errorCode, message } = {},
    } = props;

    const {
        result: { data: couponsData, total },
        loading,
    } = useSelector((state: ApplicationState) => state.coupons);

    if (errorCode) {
        return <CustomError message={message} />;
    }

    const { group_id, store_id } = parseCookies();

    const dispatch = useDispatch();

    const [form] = Form.useForm();

    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    const [currentPagination, setCurrentPagination] = useState<number>(1);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const [discountTypeModal, setDiscountTypeModal] = useState<string>('fixed_cart');

    const [updateCoupon, setUpdateCoupon] = useState<CouponsDataResponseType | null>(null);

    const [duplicate, setDuplicate] = useState(false);

    const [query, setQuery] = useState<CouponsFormType>({
        group_id,
        store_id,
    });

    useEffect(() => {
        if (updateCoupon) {
            setDiscountTypeModal(updateCoupon.discount_type);
        } else {
            setDiscountTypeModal('fixed_cart');
        }
    }, [updateCoupon]);

    const handleModal = (val = 'create' || 'create_excel') => {
        if (val === 'create_excel') {
            setDuplicate(true);
        } else {
            setDuplicate(false);
        }
        setIsShowModal((prevShowModal) => !prevShowModal);
    };

    const onEdit = (coupon: CouponsDataResponseType) => {
        setIsShowModal(true);
        setUpdateCoupon(coupon);
    };

    const onChangeDiscountType = (value: string) => {
        setDiscountTypeModal(value);
    };

    const exportToCSV = async (data: CouponsDataResponseType[]) => {
        try {
            const dataExportExcel = data.map((item: CouponsDataResponseType) => ({
                'Mã khuyến mãi': item.code,
                'Mô tả': item.name,
                'Loại giảm giá': statusText[item.discount_type],
                'Mức khuyến mãi': item.amount,
                'Áp dụng trên nền tảng': item.platform.toString(),
                'Thời gian bắt đầu': moment.unix(item.date_start).format('DD/MM/YYYY HH:mm'),
                'Thời gian kết thúc': moment.unix(item.date_expires).format('DD/MM/YYYY HH:mm'),
                'Giới hạn sử dụng cho mỗi phiếu khuyến mãi': item.usage_limit,
                'Giới hạn sử dụng trên mỗi người dùng': item.usage_limit_per_user,
                'Giới hạn số lượng sử dụng trên mỗi người dùng theo ngày': item.limit_by_day,
                'Áp dụng cho hoá đơn đạt tối thiểu': item.minimum_amount,
                'Áp dụng cho hoá đơn tối đa': item.maximum_amount,
            }));
            const fileName = `ma-khuyen-mai`;
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.xlsx';
            const ws = XLSX.utils.json_to_sheet(dataExportExcel);
            const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const dataExport = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(dataExport, fileName + fileExtension);
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const onSubmit = async (value: CreateCouponType & { range_picker: Array<moment.Moment> }) => {
        try {
            const {
                code,
                amount,
                discount_type,
                name,
                range_picker,
                product_ids,
                usage_limit,
                usage_limit_per_user,
                minimum_amount,
                maximum_amount,
                limit_by_day,
                platform,
                number_duplicate,
            } = value;
            const dataVoucher = {
                group_id,
                store_id,
                code,
                amount,
                discount_type,
                limit_by_day,
                name,
                platform,
                date_start: range_picker[0].unix(),
                date_expires: range_picker[1].unix(),
                ...(duplicate ? { duplicate } : {}),
                ...(number_duplicate ? { number_duplicate } : {}),
                ...(product_ids ? { product_ids } : {}),
                ...(usage_limit ? { usage_limit } : {}),
                ...(usage_limit_per_user ? { usage_limit_per_user } : {}),
                ...(minimum_amount ? { minimum_amount } : {}),
                ...(maximum_amount ? { maximum_amount } : {}),
            };
            setLoadingSubmit(true);
            if (updateCoupon) {
                await updateCouponApi(dataVoucher, updateCoupon._id);
            } else {
                const { data } = await createCoupon(dataVoucher);
                if (data.length) {
                    exportToCSV(data);
                }
            }
            dispatch(getCoupons({ group_id, store_id, offset: (currentPagination - 1) * 10 }));
            setLoadingSubmit(false);
            setIsShowModal(false);
            messageAntd.success('Tạo mã thành công');
        } catch (err) {
            setLoadingSubmit(false);
            messageAntd.error((err as Error).message);
        }
    };

    const submitSearchForm = (value: CouponsFormType) => {
        setQuery({
            ...query,
            ...value,
            offset: 0,
        });
        setCurrentPagination(1);
    };

    useEffect(() => {
        dispatch(getCoupons(query));
    }, [query]);

    useEffect(() => {
        form.resetFields();
        if (!isShowModal) {
            setUpdateCoupon(null);
            setDiscountTypeModal('');
        }
    }, [isShowModal]);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Mã khuyến mãi
                    </Title>
                    <Button onClick={() => handleModal('create')} type="primary" icon={<PlusOutlined />}>
                        Thêm mới
                    </Button>
                    <Button onClick={() => handleModal('create_excel')} icon={<FileExcelOutlined />}>
                        Tạo nhiều mã và xuất file excel
                    </Button>
                </Space>

                <Form form={form} onFinish={submitSearchForm}>
                    <Row gutter={[12, 12]} style={{ clear: 'both' }}>
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                            <Form.Item name="code" normalize={(value) => value.toUpperCase()}>
                                <Input placeholder="Mã khuyến mãi" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                            <Form.Item name="discount_type">
                                <Select placeholder="Tất cả loại giảm giá" style={{ width: '100%' }} allowClear>
                                    {discountTypeOptions?.map((item) => (
                                        <Option key={item.value} value={item.value}>
                                            {item.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                            <Form.Item name="platform">
                                <Select placeholder="Tất cả nền tảng" style={{ width: '100%' }} allowClear>
                                    {platformOptions.map((item) => (
                                        <Option key={item.value} value={item.value}>
                                            {item.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                            <Form.Item>
                                <Button
                                    block
                                    htmlType="submit"
                                    type="primary"
                                    icon={<FilterOutlined />}
                                    loading={loading}
                                >
                                    Lọc
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Space>
            <Table
                loading={loading}
                size="small"
                columns={columns(onEdit, dataLogin)}
                dataSource={couponsData}
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
                        setQuery({ ...query, offset: (page - 1) * 10 });
                    },
                }}
            />
            <Modal isShowModal={isShowModal} hideModal={handleModal}>
                <Form
                    form={form}
                    name="create_coupon"
                    layout="vertical"
                    onFinish={onSubmit}
                    initialValues={
                        updateCoupon
                            ? {
                                  ...updateCoupon,
                                  range_picker: [
                                      moment.unix(updateCoupon.date_start),
                                      moment.unix(updateCoupon.date_expires),
                                  ],
                              }
                            : {
                                  duplicate: true,
                                  show_user: true,
                                  discount_type: 'fixed_cart',
                              }
                    }
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            {!duplicate && (
                                <Form.Item
                                    required
                                    label="Code khuyến mãi"
                                    name="code"
                                    tooltip="Mã code áp dụng để giảm giá sản phẩm hoặc đơn hàng"
                                >
                                    <Input
                                        placeholder="Ví dụ: GG0150"
                                        required
                                        disabled={!!updateCoupon}
                                        pattern="[A-Z0-9]+"
                                    />
                                </Form.Item>
                            )}
                            <Form.Item label="Mô tả" name="name" required>
                                <Input required />
                            </Form.Item>
                            <Form.Item label="Loại giảm giá" name="discount_type" required>
                                <Select style={{ width: '100%' }} onChange={onChangeDiscountType}>
                                    {discountTypeOptions.map(({ value, label }) => (
                                        <Option key={value} value={value}>
                                            {label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Mức khuyến mãi"
                                name="amount"
                                required
                                tooltip="Số tiền hoặc số phần trăm khuyến mãi"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') || ''}
                                    min={0}
                                    max={
                                        discountTypeModal === 'percent_cart' || discountTypeModal === 'percent_product'
                                            ? 100
                                            : Number.MAX_SAFE_INTEGER
                                    }
                                    style={{ width: '100%' }}
                                    required
                                />
                            </Form.Item>
                            {(discountTypeModal === 'fixed_product' || discountTypeModal === 'percent_product') && (
                                <Form.Item
                                    label="Sản phẩm áp dụng khuyến mãi"
                                    name="product_ids"
                                    tooltip="Áp dụng cho loại giảm giá trên sản phẩm"
                                    rules={[
                                        {
                                            type: 'array' as const,
                                            required: true,
                                            message: 'Vui lòng chọn sản phẩm được khuyến mãi!',
                                        },
                                    ]}
                                >
                                    <Select mode="multiple" style={{ width: '100%' }} className="select-product">
                                        {serverDataProducts?.map((item) => (
                                            <Option key={item._id} value={item._id}>
                                                <Space>
                                                    <Avatar shape="square" src={item.logo} />
                                                    {item.name}
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                            <Form.Item
                                label="Áp dụng trên nền tảng"
                                name="platform"
                                tooltip="Áp dụng cho loại giảm giá trên sản phẩm"
                                rules={[
                                    {
                                        type: 'array' as const,
                                        required: true,
                                        message: 'Vui lòng chọn nền tảng',
                                    },
                                ]}
                            >
                                <Select mode="multiple" style={{ width: '100%' }}>
                                    <Option value="web">WEB</Option>
                                    <Option value="miniapp">MINIAPP (ACheckin)</Option>
                                    <Option value="app">App di động</Option>
                                </Select>
                            </Form.Item>
                            {duplicate && (
                                <Form.Item required label="Số lượng mã cần nhân bản tối đa 20" name="number_duplicate">
                                    <InputNumber required min={1} max={20} style={{ width: '100%' }} />
                                </Form.Item>
                            )}
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="range_picker"
                                label="Ngày áp dụng"
                                rules={[
                                    { type: 'array' as const, required: true, message: 'Vui lòng chọn thời gian!' },
                                ]}
                            >
                                <RangePicker style={{ width: '100%' }} showTime disabledDate={disabledDate} />
                            </Form.Item>
                            <Form.Item
                                label="Giới hạn sử dụng cho mỗi phiếu khuyến mãi"
                                name="usage_limit"
                                tooltip="Mỗi phiếu khuyến mãi được sử dụng bao nhiêu lần trước khi hết hạn. Nếu để trống thì không giới hạn"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Giới hạn sử dụng trên mỗi người dùng"
                                name="usage_limit_per_user"
                                tooltip="Mỗi phiếu khuyến mãi được sử dụng bao nhiêu lần bởi mỗi một người dùng. Sử dụng email thanh toán cho khách vãng lai và ID cho những thành viên đã đăng nhập. Nếu để trống thì không giới hạn"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Giới hạn số lượng sử dụng trên mỗi người dùng theo ngày"
                                name="limit_by_day"
                                tooltip="Mỗi phiếu khuyến mãi được sử dụng bao nhiêu lần bởi mỗi một người dùng trên một ngày"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Áp dụng cho hoá đơn đạt tối thiểu"
                                name="minimum_amount"
                                tooltip="Tổng số tiền tối thiểu trên hoá đơn để được hưởng khuyến mãi này. Nếu để trống thì không giới hạn"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Áp dụng cho hoá đơn tối đa"
                                name="maximum_amount"
                                tooltip="Tổng số tiền tối đa trên hoá đơn để được hưởng khuyến mãi này. Nếu để trống thì không giới hạn"
                            >
                                <InputNumber
                                    formatter={(value) => {
                                        return `${value}`.replace(/\D/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button
                        block
                        type="primary"
                        htmlType="submit"
                        loading={loadingSubmit}
                        disabled={
                            !!updateCoupon &&
                            Date.now() / 1000 > updateCoupon.date_start &&
                            Date.now() / 1000 < updateCoupon.date_expires
                        }
                    >
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

    await store.dispatch(getProducts(group_id, store_id, tokenqr));

    const {
        error: { errorCode: errorCodeProducts },
        error: errorProducts,
    } = store.getState().products;

    if (errorCodeProducts === 4030) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            products: store.getState().products,
            error: { ...errorProducts },
        },
    };
});

export default Coupons;
