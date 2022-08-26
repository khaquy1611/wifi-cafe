import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { OrdersDataType } from 'api/types';
import { Card, Space, Avatar, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import moment from 'moment';

const { Paragraph } = Typography;

interface PropsType {
    orderId: string;
    item: OrdersDataType;
    handleOrderDetail: (orderID: string, order_id?: string) => void;
}

const OrderCard = ({ orderId, item, handleOrderDetail }: PropsType) => {
    const {
        result: { cards },
    } = useSelector((state: ApplicationState) => state.cardTabs);
    const card = cards.find((item) => item.orderId === orderId);

    const [expand, setExpand] = useState<boolean>(false);

    return (
        <Card
            className={card?._id === item._id ? 'cardOrder active' : 'cardOrder'}
            style={{ cursor: 'pointer' }}
            onClick={async () => {
                if (card?._id === item._id) return;
                handleOrderDetail(item._id, item.id);
            }}
            bordered={false}
        >
            <div className="cardOrder_Inner">
                <div className="cardOrder_Customer">
                    <Avatar className="cardOrder_CustomerAvatar" size="small" src={item.customer_avatar} />
                    <div className="cardOrder_CustomerInfo">
                        <div className="cardOrder_CustomerName">{item.customer_name}</div>
                        <div className="cardOrder_ID">{item.id}</div>
                    </div>
                    <div className="cardOrder_Time">
                        <div>{moment(item.createdAt).fromNow()}</div>
                        <div>{moment(item.createdAt).format('DD/MM - HH:mm')}</div>
                    </div>
                </div>
                <div className="cardOrder_Row cardOrder_Place">
                    <div className="float-left" style={{ fontWeight: 'bold' }}>
                        {item.status_order === 'at-place'
                            ? `${item.sub_department_name} - ${item.department_name}`
                            : 'Mang đi'}
                    </div>
                    <div className="float-right">
                        <b>{item.number}</b> món
                    </div>
                </div>
                <div className="cardOrder_List">
                    <div className="cardOrder_ListLeft">Tổng tiền:</div>
                    <div className="cardOrder_ListRight" style={{ color: '#dd4b39' }}>
                        {item.total.toLocaleString('en-AU')} {item.currency}
                    </div>
                </div>
                <div className="cardOrder_List">
                    <div className="cardOrder_ListLeft">Thanh toán</div>
                    <div className="cardOrder_ListRight">
                        {item.status_payment === 'completed' ? (
                            <CheckCircleFilled style={{ color: '#0fa44a' }} />
                        ) : (
                            <CloseCircleFilled style={{ color: '#dd4b39' }} />
                        )}
                    </div>
                </div>
                <div className="cardOrder_List">
                    <div className="cardOrder_ListLeft">Giao món</div>
                    <div className="cardOrder_ListRight">
                        {item.status_service === 'completed' ? (
                            <CheckCircleFilled style={{ color: '#0fa44a' }} />
                        ) : (
                            <CloseCircleFilled style={{ color: '#dd4b39' }} />
                        )}
                    </div>
                </div>
                <div className="cardOrder_List last">
                    <div className="cardOrder_ListLeft">Danh sách món</div>
                </div>
                <div className="cardOrder_Product">
                    <Paragraph ellipsis={!expand}>
                        {item.products.map((item) => {
                            return (
                                <Space key={item._id} style={{ width: '100%', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: 'bold' }}>- {item.name}</div>
                                    <div>
                                        ({item.number_recieve}/{item.quantity})
                                    </div>
                                </Space>
                            );
                        })}
                        {!expand && item.products.length >= 2 && (
                            <div>
                                ...{' '}
                                <a
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpand(true);
                                    }}
                                >
                                    Xem thêm
                                </a>
                            </div>
                        )}
                        {expand && (
                            <a
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpand(false);
                                }}
                            >
                                Thu gọn
                            </a>
                        )}
                    </Paragraph>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;
