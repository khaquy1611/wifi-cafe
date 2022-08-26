import React, { useState } from 'react';
import { Row, Col, Select, List } from 'antd';
import { OrdersDataType } from 'api/types';
import SearchBox from 'components/client/home/components/Search';
import OrderCard from './OrderCard';

const { Option } = Select;
interface PropsType {
    orderId: string;
    ordersData?: OrdersDataType[];
    handleOrderDetail: (orderID: string, order_id?: string) => void;
    loadingOrder: boolean;
}

const OrdersTab = ({ orderId, ordersData, handleOrderDetail, loadingOrder }: PropsType) => {
    const [searchOrder, setSearchOrder] = useState<string>('');
    const [statusState, setStatus] = useState<string>('all');
    const [statusOrder, setStatusOrder] = useState<string>('all');
    const [statusPayment, setStatusPayment] = useState<string>('all');
    const [statusService, setStatusService] = useState<string>('all');

    const orders = ordersData
        ?.filter((item) => item.id.toLocaleLowerCase().includes(searchOrder.toLocaleLowerCase()))
        .filter((item) => {
            if (statusState === 'all') return item;
            return item.status === statusState;
        })
        .filter((item) => {
            if (statusOrder === 'all') return item;
            return item.status_order === statusOrder;
        })
        .filter((item) => {
            if (statusPayment === 'all') return item;
            return item.status_payment === statusPayment;
        })
        .filter((item) => {
            if (statusService === 'all') return item;
            return item.status_service === statusService;
        });

    return (
        <div style={{ maxHeight: 'calc(100vh - 126px)', overflow: 'auto' }}>
            <div className="web-admin-header-content">
                <Row gutter={[12, 12]} className="listForm">
                    <Col xs={24} sm={12} md={12} lg={12} xl={6} className="itemForm">
                        <div className="itemForm_Label">Trạng thái đơn</div>
                        <Select value={statusState} onChange={setStatus} style={{ width: '100%' }}>
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="processing">Đang xử lý</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={6} className="itemForm">
                        <div className="itemForm_Label">Hình thức phục vụ</div>
                        <Select value={statusOrder} onChange={setStatusOrder} style={{ width: '100%' }}>
                            <Option value="all">Tất cả</Option>
                            <Option value="take-away">Mang đi</Option>
                            <Option value="at-place">Ăn tại bàn</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={6} className="itemForm">
                        <div className="itemForm_Label">Trạng thái thanh toán</div>
                        <Select value={statusPayment} onChange={setStatusPayment} style={{ width: '100%' }}>
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Chờ thanh toán</Option>
                            <Option value="completed">Đã thanh toán</Option>
                            <Option value="failed">Thanh toán lỗi</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={6} className="itemForm">
                        <div className="itemForm_Label">Trạng thái phục vụ</div>
                        <Select value={statusService} onChange={setStatusService} style={{ width: '100%' }}>
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Chờ giao món</Option>
                            <Option value="completed">Đã giao món</Option>
                        </Select>
                    </Col>
                    <Col span={24}>
                        <SearchBox
                            options={
                                ordersData?.map((item) => ({
                                    value: item.id || '',
                                    label: item.id || '',
                                })) || []
                            }
                            search={searchOrder}
                            setSearch={setSearchOrder}
                            placeholder="Tìm nhanh theo mã đơn hàng"
                        />
                    </Col>
                </Row>
            </div>
            <div className="web-admin-site-card-wrapper">
                <div className="bxHeader">
                    <div className="bxHeader_Inner">
                        Số đơn hàng: <strong>{orders?.length}</strong>
                    </div>
                </div>
                <List
                    loading={loadingOrder}
                    grid={{ gutter: 12, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                    dataSource={orders}
                    renderItem={(item) => (
                        <List.Item>
                            <OrderCard orderId={orderId} item={item} handleOrderDetail={handleOrderDetail} />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default OrdersTab;
