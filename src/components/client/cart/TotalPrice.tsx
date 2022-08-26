import React from 'react';
import { Row, Col } from 'antd';

interface Props {
    totalMoney: number;
    couponValue?: number;
}

const TotalPrice = ({ totalMoney, couponValue }: Props) => (
    <div className="listBox">
        <Row className="listBox_Item">
            <Col flex={1}>Thành tiền</Col>
            <Col className="price-item" style={{ textAlign: 'right' }} flex={1}>
                {totalMoney.toLocaleString('en-AU')} ₫
            </Col>
        </Row>
        <Row className="listBox_Item">
            <Col flex={1}>Giảm giá</Col>
            <Col className="price-item" style={{ textAlign: 'right' }} flex={1}>
                {!couponValue || '-'}
                {(couponValue || 0).toLocaleString('en-AU')} ₫
            </Col>
        </Row>
        <Row className="listBox_Item">
            <Col style={{ fontWeight: 600 }} flex={1}>
                Số tiền thanh toán
            </Col>
            <Col className="price-total" style={{ fontSize: 20, textAlign: 'right' }} flex={1}>
                {(totalMoney - (couponValue || 0)).toLocaleString('en-AU')} ₫
            </Col>
        </Row>
    </div>
);

export default TotalPrice;
