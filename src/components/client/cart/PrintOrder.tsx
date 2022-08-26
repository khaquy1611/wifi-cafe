/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Col, Row } from 'antd';
import QRCode from 'qrcode.react';
import { OrdersDataType } from 'api/types';
import { CardType } from 'reduxStore/cardTabs/types';

interface PropsType {
    group_ws?: string;
    admin_name?: string;
    info?: OrdersDataType | CardType;
}
class TemplateOrder extends Component<PropsType> {
    render() {
        const { group_ws, info, admin_name } = this.props;
        return (
            <div
                className="table"
                style={{
                    width: 280,
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        marginBottom: 12,
                    }}
                >
                    <h3 style={{ marginBottom: 0 }}>{info?.store?.name}</h3>
                    <div>Địa chỉ: {info?.store?.address}</div>
                    <div>Điện thoại: {info?.store?.phone_number}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <h4 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 12 }}>
                        PHIẾU THANH TOÁN
                        <span style={{ fontSize: 13, display: 'block', fontWeight: 'normal' }}>
                            Hoá đơn: {info?.id}
                        </span>
                    </h4>
                    <Row>
                        {info?.status_order === 'at-place' ? (
                            <>
                                <Col span={12}>Khu vực: {info?.department_name}</Col>
                                <Col span={12}>Bàn: {info?.sub_department_name}</Col>
                            </>
                        ) : (
                            <Col span={24}>Ghi chú: Đơn mang đi</Col>
                        )}
                        <Col span={24}>Thu ngân: {admin_name}</Col>
                        <Col span={24}>Khách hàng: {info?.customer_name}</Col>
                    </Row>
                </div>
                <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', paddingTop: 6 }}>
                    {info?.list_products?.map((item) => (
                        <div key={item.product_id} style={{ marginBottom: 6 }}>
                            <div>
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                                <div>{item.note}</div>
                            </div>
                            <div>
                                <span>
                                    {item.quantity} x {item.price.toLocaleString('en-AU')}
                                </span>
                                <span className="float-right" style={{ fontWeight: 600 }}>
                                    {(item.quantity * item.price).toLocaleString('en-AU')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 12, marginBottom: 12, fontSize: 16, fontWeight: 600, lineHeight: 2 }}>
                    <div>
                        <span>Tổng cộng </span>
                        <span className="float-right">{(info?.total || 0).toLocaleString('en-AU')}</span>
                    </div>
                    <div>
                        <span>Giảm </span>
                        <span className="float-right">
                            {!!info?.discount_amount && '-'}
                            {(info?.discount_amount || 0).toLocaleString('en-AU')}
                        </span>
                    </div>
                    <div>
                        <span>Tổng thanh toán </span>
                        <span className="float-right" style={{ fontSize: 20 }}>
                            {((info?.total || 0) - (info?.discount_amount || 0)).toLocaleString('en-AU')}
                        </span>
                    </div>
                </div>
                {info?.payment_url && group_ws && (
                    <div style={{ marginBottom: 12, textAlign: 'center' }}>
                        <div style={{ marginBottom: 12 }}>Quý khách vui lòng dùng ACheckin để quét mã thanh toán</div>
                        <QRCode
                            value={`acheckin://app?p=${process.env.MINIAPP_BUNDLE_ID}&wi=${group_ws}&d=${info._id}`}
                            size={200}
                        />
                    </div>
                )}
                <div style={{ marginTop: 24, textAlign: 'center' }}>{info?.store?.message}</div>
            </div>
        );
    }
}

export default TemplateOrder;
