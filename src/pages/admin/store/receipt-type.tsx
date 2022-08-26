import React, { useState, useEffect } from 'react';
import { Typography, Button, Select, Input, Table, Tag, Form, Row, Col, Space } from 'antd';
import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
import moment from 'moment';
import pickBy from 'lodash/pickBy';
import identity from 'lodash/identity';
import { ReceiptTypeType } from 'api/types';
import ModalCustomReceiptType from 'components/admin/inventory/ModalCustomReceiptType';
import { ApplicationState } from 'reduxStore/store';
import { useSelector, useDispatch } from 'react-redux';
import { getReceipt } from 'reduxStore/receipt-type/actions';

const { Title } = Typography;
const { Option } = Select;

const VoucherList: React.FC = () => {
    const [form] = Form.useForm();
    const { group_id, store_id } = parseCookies();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isModalVisibleAdd, setIsModalVisibleAdd] = useState<boolean>(false);

    const {
        result: { data, total },
        loading,
    } = useSelector((state: ApplicationState) => state.receipt);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getReceipt({ group_id, store_id, page: 1 }));
    }, []);

    const handleShowModalAdd = () => {
        setIsModalVisibleAdd(!isModalVisibleAdd);
        form.resetFields();
    };

    const submitSearchForm = (value: ReceiptTypeType) => {
        const values = pickBy(value, identity);
        dispatch(getReceipt({ ...values, group_id, store_id, page: 1 }));
        setCurrentPage(1);
    };

    const columns = [
        {
            title: <b>Thời gian tạo phiếu</b>,
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => {
                return <>{moment(text).format('DD/MM/YYYY HH:mm:ss')}</>;
            },
        },
        {
            title: <b>Tên loại phiếu</b>,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <b>Loại</b>,
            dataIndex: 'type',
            key: 'type',
            render: (text: string) => {
                let type = '';
                if (text === 'import') {
                    type = 'Nhập Kho';
                } else if (text === 'export') {
                    type = 'Xuất Kho';
                }
                return <Tag color={text === 'import' ? 'blue' : 'red'}>{type.toUpperCase()}</Tag>;
            },
        },
    ];

    const handleModalCancel = () => {
        setIsModalVisibleAdd(false);
    };

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Danh sách loại phiếu
                    </Title>
                    <Button onClick={handleShowModalAdd} type="primary" icon={<PlusOutlined />}>
                        Tạo loại phiếu
                    </Button>
                </Space>
                <Form form={form} onFinish={submitSearchForm}>
                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="name">
                                <Input placeholder="Tên Loại Phiếu" allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="type">
                                <Select allowClear placeholder="Loại Phiếu">
                                    <Option value="import">Nhập Kho</Option>
                                    <Option value="export">Xuất Kho</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6} md={3}>
                            <Form.Item>
                                <Button htmlType="submit" block type="primary" icon={<FilterOutlined />}>
                                    Lọc
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Table
                    size="small"
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    pagination={{
                        showSizeChanger: false,
                        current: currentPage,
                        total,
                        onChange: (page) => {
                            setCurrentPage(page);
                        },
                    }}
                />
                <ModalCustomReceiptType
                    title="Thêm loại phiếu mới"
                    isModalVisibleAdd={isModalVisibleAdd}
                    handleModalCancel={handleModalCancel}
                    setIsModalVisibleAdd={setIsModalVisibleAdd}
                />
            </Space>
        </div>
    );
};

export default VoucherList;
