import React from 'react';
import { Button, Row, Col } from 'antd';
import { CreditCardOutlined, SaveOutlined } from '@ant-design/icons';
import { CardType } from 'reduxStore/cardTabs/types';

interface PropsType {
    onSubmitChangeOrderStatusService: (type: 'complete_service' | 'complete_payment') => void;
    card: CardType | undefined;
    totalMoney: number;
    discount_amount: number;
    loadingPayment: boolean;
    loadingSave: boolean;
    onSubmitSave: () => void;
    onSubmit: () => void;
}

const HeaderOrderTab = ({
    loadingPayment,
    card,
    onSubmitChangeOrderStatusService,
    loadingSave,
    onSubmitSave,
    onSubmit,
    totalMoney,
    discount_amount,
}: PropsType) => {
    return (
        <>
            <Row>
                {card?.status !== 'completed' && card?.status !== 'cancelled' && (
                    <>
                        {card?.status_payment === 'completed' ? (
                            <Col span={24}>
                                <Button
                                    loading={loadingPayment}
                                    onClick={() => onSubmitChangeOrderStatusService('complete_service')}
                                    className="no-border-radius"
                                    icon={<CreditCardOutlined />}
                                    block
                                    type="primary"
                                    size="large"
                                >
                                    Giao món & duyệt đơn
                                </Button>
                            </Col>
                        ) : (
                            <>
                                <Col xs={24} sm={24} md={6} lg={6} xl={6}>
                                    <Button
                                        loading={loadingSave}
                                        onClick={onSubmitSave}
                                        className="no-border-radius"
                                        icon={<SaveOutlined />}
                                        block
                                        size="large"
                                    >
                                        Lưu
                                    </Button>
                                </Col>
                                <Col xs={24} sm={24} md={18} lg={18} xl={18}>
                                    <div className="payCart">
                                        <div className="payCart_Total">
                                            <div className="payCart_TotalTitle">Tổng tiền</div>
                                            <div className="payCart_TotalNums">
                                                {(totalMoney - discount_amount).toLocaleString('en-AU')} ₫
                                            </div>
                                        </div>
                                        <Button
                                            loading={loadingPayment}
                                            onClick={onSubmit}
                                            className="no-border-radius"
                                            icon={<CreditCardOutlined />}
                                            type="primary"
                                            size="large"
                                        >
                                            Thanh toán
                                        </Button>
                                    </div>
                                </Col>
                            </>
                        )}
                    </>
                )}
            </Row>
        </>
    );
};

export default HeaderOrderTab;
