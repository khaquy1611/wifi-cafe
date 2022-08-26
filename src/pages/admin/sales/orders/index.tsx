import React, { useEffect, useState, useRef } from 'react';
import CustomError from 'pages/_error';
import wrapper from 'reduxStore';
import Link from 'next/link';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getAllOrders } from 'reduxStore/allOrders/actions';
import { getPaymentMethods } from 'reduxStore/paymentMethods/actions';
import { PaymentMethodsType } from 'reduxStore/paymentMethods/types';
import { getOrderDetailApi, getAllOrdersApi } from 'api/store';
import { OrdersDataType, OrderDetailResponeType, ErrorType, OrdersFormValuesType, OrdersForm } from 'api/types';
import {
    Typography,
    Table,
    Tag,
    Drawer,
    Select,
    Avatar,
    Input,
    Tooltip,
    DatePicker,
    Button,
    message as messageAnt,
    Form,
    Row,
    Col,
    Descriptions,
} from 'antd';
import { PrinterOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import CartProduct from 'components/client/cart/CartProduct';
import PrintOrder from 'components/client/cart/PrintOrder';
import { parseCookies } from 'nookies';
import { convertDuration } from 'common';
import moment from 'moment';
import { ColumnsType } from 'antd/lib/table/interface';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

const disabledDate = (current: moment.Moment) => current > moment().endOf('day');

const statusText = {
    pending: 'Chờ xử lý',
    processing: 'Đang phục vụ',
    cancelled: 'Đã huỷ đơn',
    completed: 'Thành công',
};

const statusOrderText = {
    'at-place': 'Ăn tại bàn',
    'take-away': 'Mang về',
};

const columns: (onOpenDrawer: (orderId: OrdersDataType) => void) => ColumnsType<OrdersDataType> = (onOpenDrawer) => [
    {
        title: 'Đơn hàng',
        dataIndex: 'id',
        key: 'id',
        render: (text: number, record: OrdersDataType) => (
            <span onClick={() => onOpenDrawer(record)}>
                <a>{text}</a> {record.customer_name}
            </span>
        ),
    },
    {
        title: 'Đã đặt',
        dataIndex: 'number',
        key: 'number',
        responsive: ['xl'],
        render: (text: number) => <span>{text} món</span>,
    },
    {
        title: 'Loại hình',
        dataIndex: 'status_order',
        key: 'status_order',
        render: (text: 'take-away' | 'at-place', record: OrdersDataType) => (
            <Tooltip title={record.status_order_name}>
                <Avatar shape="square" src={`https://s3.kstorage.vn/qrpayment/common/${text}.png`} />
            </Tooltip>
        ),
    },
    {
        title: 'Thanh toán',
        dataIndex: 'payment_method',
        key: 'payment_method',
        responsive: ['xl'],
        render: (text, record: OrdersDataType) => (
            <>
                <Avatar shape="square" src={`https://s3.kstorage.vn/qrpayment/common/${text}.png`} />{' '}
                <Avatar
                    size={16}
                    shape="square"
                    src={`https://s3.kstorage.vn/qrpayment/common/payment_${record.status_payment}.png`}
                />
            </>
        ),
    },
    {
        title: 'Ngày đặt',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
    {
        title: 'Tiền khuyến mãi',
        dataIndex: 'discount_amount',
        key: 'discount_amount',
        render: (text: number) => <strong>{text.toLocaleString('en-AU')} ₫</strong>,
    },
    {
        title: 'Tiền đơn hàng',
        dataIndex: 'total',
        key: 'total',
        render: (text: number) => <strong>{text.toLocaleString('en-AU')} ₫</strong>,
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (text: 'pending' | 'processing' | 'cancelled' | 'completed') => (
            <Tag
                color={
                    text === 'completed'
                        ? '#0fa44a'
                        : text === 'pending'
                        ? '#f39c12'
                        : text === 'processing'
                        ? '#00c0ef'
                        : '#ff4d4f'
                }
            >
                {statusText[text]}
            </Tag>
        ),
    },
];

const statusOrderOptions: ('take-away' | 'at-place')[] = ['take-away', 'at-place'];
const statusOptions: ('pending' | 'processing' | 'cancelled' | 'completed')[] = [
    'pending',
    'processing',
    'cancelled',
    'completed',
];

interface PropsType {
    paymentMethods: PaymentMethodsType;
    error: ErrorType;
    discount_id: string;
    customer_id: string;
}

const Orders = (props: PropsType) => {
    const [form] = Form.useForm();
    const {
        paymentMethods: {
            result: { data: serverDataPaymentMethods },
        },
        discount_id,
        customer_id,
        error: { errorCode, message } = {},
    } = props;

    if (errorCode) {
        return <CustomError message={message} />;
    }

    const { group_id, store_id, couponCode, customerName } = parseCookies();

    const dispatch = useDispatch();

    const componentRef = useRef(null);
    const {
        result: { data, total },
        loading,
    } = useSelector((state: ApplicationState) => state.allOrders);

    const [currentPagination, setCurrentPagination] = useState<number>(1);
    const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
    const [orderDetail, setOrderDetail] = useState<OrdersDataType | undefined>(undefined);
    const [orderDetailLoading, setOrderDetailLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<OrdersFormValuesType>({
        group_id,
        store_id,
        discount_id,
        customer_id,
    });
    const onOpenDrawer = async (order: OrdersDataType) => {
        setDrawerVisible(true);
        setOrderDetail(order);
        setOrderDetailLoading(true);
        const { data }: OrderDetailResponeType = await getOrderDetailApi(order._id, group_id, store_id);
        setOrderDetail(data);
        setOrderDetailLoading(false);
    };

    const handlePrintPreview = useReactToPrint({
        content: () => componentRef.current,
    });

    const getOrders = (offset = 0) => {
        return getAllOrdersApi({
            ...query,
            type: 'export',
            offset,
        });
    };

    const exportToCSV = async () => {
        try {
            if (!data?.length) {
                messageAnt.error('Không có dữ liệu báo cáo');
                return;
            }
            setOrderDetailLoading(true);
            const totalPage = Math.floor((total || 0) / 5000) + 1;
            const exportData = [];
            for (let i = 0; i < totalPage; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                const { data: arrayExport } = await getOrders(i * 5000);
                exportData.push(...arrayExport);
            }

            const dataExportExcel = exportData.map((item: OrdersDataType) => ({
                'Mã đơn hàng': item.id,
                'Mã khách hàng': item.staff_id,
                'Khách hàng': item.customer_name,
                'Số lượng': item.number,
                'Tiền đơn hàng': item.total,
                'Giảm giá': item.discount_amount,
                'Tiền thanh toán': item.total - (item.discount_amount || 0),
                'Loại hình': item.status_order_name,
                'Thanh toán': item.payment_method_name,
                'Trạng thái': statusText[item.status],
                'Mã giảm giá': item.discount_code,
                'Ngày đặt': moment(item.createdAt).format('DD/MM/YYYY HH:mm'),
                'Mã tham chiếu AppotaPay': item.orderId,
            }));
            const fileName = `bao-cao-don-hang`;
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.xlsx';
            const ws = XLSX.utils.json_to_sheet(dataExportExcel);
            const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const dataExport = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(dataExport, fileName + fileExtension);
            setOrderDetailLoading(false);
        } catch (err) {
            setOrderDetailLoading(false);
            messageAnt.error((err as Error).message);
        }
    };

    const submitSearchForm = async (values: OrdersForm) => {
        const { dateFormat } = values;
        const start = dateFormat && dateFormat[0] && `${dateFormat[0].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        const end = dateFormat && dateFormat[1] && `${dateFormat[1].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        delete values.dateFormat;
        setQuery({
            ...query,
            ...values,
            offset: '0',
            start,
            end,
        });
        setCurrentPagination(1);
    };

    useEffect(() => {
        dispatch(getAllOrders(query));
    }, [query]);

    return (
        <div className="site-layout-background">
            <Title level={2}>
                Quản lý đơn hàng {customer_id && customerName}{' '}
                {discount_id && couponCode && `theo mã khuyến mãi ${couponCode}`}
            </Title>
            <Form form={form} onFinish={submitSearchForm}>
                <Row gutter={[24, 0]}>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="payment_method">
                            <Select placeholder="Tất cả phương thức" allowClear>
                                {serverDataPaymentMethods?.map((item) => (
                                    <Option key={item._id} value={item.code as string}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="status_order">
                            <Select placeholder="Tất cả loại hình" allowClear>
                                {statusOrderOptions?.map((item) => (
                                    <Option key={item} value={item}>
                                        {statusOrderText[item]}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="status">
                            <Select placeholder="Tất cả trạng thái" allowClear>
                                {statusOptions?.map((item) => (
                                    <Option key={item} value={item}>
                                        {statusText[item]}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="order_closing">
                            <Select placeholder="Tất cả đơn" allowClear>
                                <Option value="late">Đơn duyệt muộn hoặc chưa</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="id" normalize={(value) => value.toUpperCase()}>
                            <Input placeholder="Mã đơn hàng" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="orderId" normalize={(value) => value.toUpperCase()}>
                            <Input placeholder="Mã tham chiếu" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                        <Form.Item name="dateFormat">
                            <RangePicker
                                style={{ width: '100%' }}
                                dropdownClassName="custom-range-picker"
                                format={dateFormat}
                                disabledDate={disabledDate}
                                ranges={{
                                    'Hôm nay': [moment(), moment()],
                                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                    'Tuần này': [moment().startOf('week'), moment()],
                                    'Bẩy ngày qua': [moment().subtract(1, 'weeks'), moment()],
                                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                                    'Một tháng qua': [moment().subtract(1, 'months'), moment()],
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={3} xl={3}>
                        <Form.Item>
                            <Button
                                block
                                htmlType="submit"
                                type="primary"
                                icon={<FilterOutlined />}
                                loading={orderDetailLoading}
                            >
                                Lọc
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={3} xl={3}>
                        <Button block onClick={exportToCSV} icon={<DownloadOutlined />} loading={orderDetailLoading}>
                            Xuất báo cáo
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Table
                loading={loading}
                size="small"
                columns={columns(onOpenDrawer)}
                dataSource={data}
                rowKey="_id"
                pagination={{
                    position: ['topRight', 'bottomRight'],
                    current: currentPagination,
                    total,
                    showSizeChanger: false,
                    showTotal: (total) => {
                        return `Tổng ${total} đơn hàng`;
                    },
                    onChange: async (page) => {
                        setCurrentPagination(page);
                        setQuery({ ...query, offset: `${(page - 1) * 10}` });
                    },
                }}
            />
            <Drawer
                title="Thông tin đơn hàng"
                placement="right"
                width="100%"
                onClose={() => {
                    setDrawerVisible(false);
                    setOrderDetail(undefined);
                }}
                visible={drawerVisible}
            >
                <Descriptions title="" bordered>
                    <Descriptions.Item label="Mã Đơn Hàng" span={12}>
                        {orderDetail?.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã tham chiếu" span={12}>
                        <Paragraph copyable>{orderDetail?.orderId}</Paragraph>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bàn" span={12}>
                        {orderDetail?.status_order === 'at-place' ? (
                            <span>
                                {orderDetail?.sub_department_name} ({orderDetail?.department_name})
                            </span>
                        ) : (
                            'Đơn mang về'
                        )}
                    </Descriptions.Item>
                    {orderDetail?.user_name && (
                        <Descriptions.Item label="Thu ngân" span={12}>
                            <Text type="success">{orderDetail?.user_name}</Text>
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Khách hàng" span={12}>
                        <Text type="success">
                            {orderDetail?.customer_avatar && <Avatar src={orderDetail?.customer_avatar} />}{' '}
                            {orderDetail?.customer_name}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo đơn" span={12}>
                        {moment(orderDetail?.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian phục vụ" span={12}>
                        {convertDuration(orderDetail?.updatedAt as string, orderDetail?.createdAt as string)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hình thức thanh toán" span={12}>
                        {orderDetail?.payment_method_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái thanh toán" span={12}>
                        {orderDetail?.status_payment === 'completed' ? (
                            <Tag color="#0fa44a" style={{ marginRight: 0 }}>
                                Đã thanh toán
                            </Tag>
                        ) : (
                            <Tag color="#dd4b39" style={{ marginRight: 0 }}>
                                Chưa thanh toán
                            </Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian thanh toán" span={12}>
                        {orderDetail?.date_payment &&
                            moment.unix(Number(orderDetail?.date_payment)).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái phục vụ" span={12}>
                        {orderDetail?.status_service === 'completed' ? (
                            <Tag color="#0fa44a" style={{ marginRight: 0 }}>
                                Đã giao món
                            </Tag>
                        ) : (
                            <Tag color="#dd4b39" style={{ marginRight: 0 }}>
                                Chưa giao món
                            </Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đơn hàng" span={12}>
                        <Tag
                            style={{ marginRight: 0 }}
                            color={
                                orderDetail?.status === 'completed'
                                    ? '#0fa44a'
                                    : orderDetail?.status === 'pending'
                                    ? '#f39c12'
                                    : orderDetail?.status === 'processing'
                                    ? '#00c0ef'
                                    : '#dd4b39'
                            }
                        >
                            {statusText[orderDetail?.status || 'pending']}
                        </Tag>
                    </Descriptions.Item>
                    {orderDetail?.note && (
                        <Descriptions.Item label="Lý do hủy đơn" span={12}>
                            {orderDetail?.note}
                        </Descriptions.Item>
                    )}
                    {orderDetail?.order_closing_note && (
                        <Descriptions.Item label="Đơn duyệt muộn">{orderDetail?.order_closing_note}</Descriptions.Item>
                    )}
                    {orderDetail?.discount_id && (
                        <Descriptions.Item label="Mã khuyến mãi">
                            {orderDetail?.discount_name} (Code: <Link href="">{orderDetail?.discount_code}</Link>)
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Tổng tiền" span={12}>
                        <Title level={5}>{orderDetail?.total.toLocaleString('en-AU')} ₫</Title>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giảm giá" span={12}>
                        <Title level={5}>
                            {!orderDetail?.discount_amount || '-'}
                            {(orderDetail?.discount_amount || 0).toLocaleString('en-AU')} ₫
                        </Title>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng thanh toán" span={12}>
                        <Title level={4}>
                            <Text type="danger">
                                {((orderDetail?.total || 0) - (orderDetail?.discount_amount || 0)).toLocaleString(
                                    'en-AU',
                                )}{' '}
                                đ
                            </Text>
                        </Title>
                    </Descriptions.Item>
                </Descriptions>
                <CartProduct loading={orderDetailLoading} listProducts={orderDetail?.list_products} actions={false} />
                <div className="text-right">
                    <Button type="primary" onClick={handlePrintPreview} icon={<PrinterOutlined />}>
                        In hoá đơn
                    </Button>
                </div>
                <div style={{ display: 'none' }}>
                    <PrintOrder ref={componentRef} admin_name={orderDetail?.user_name} info={orderDetail} />
                </div>
            </Drawer>
        </div>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const {
        store,
        query: { customer_id, discount_id },
    } = context;
    const { tokenqr, group_id, store_id } = parseCookies(context);

    await store.dispatch(getPaymentMethods(group_id, store_id, tokenqr));

    const {
        error: { errorCode: errorCodePaymentMethods },
        error: errorPaymentMethods,
    } = store.getState().paymentMethods;

    if (errorCodePaymentMethods === 4030) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            paymentMethods: store.getState().paymentMethods,
            error: { ...errorPaymentMethods },
            customer_id: customer_id || '',
            discount_id: discount_id || '',
        },
    };
});

export default Orders;
