import React from 'react';
import Image from 'next/image';
import Modal from 'components/admin/Modal';
import { listBank, listVisa } from 'common';
import { Row, Col, Button } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

interface Props {
    paymentMethod: string;
    bankCode: string;
    setBankCode: (value: string) => void;
    isShowBankModal: boolean;
    loading: boolean;
    setIsShowBankModal: (value: boolean) => void;
    onSubmitBank: () => void;
}

const BankModal = ({
    paymentMethod,
    bankCode,
    loading,
    setBankCode,
    isShowBankModal,
    setIsShowBankModal,
    onSubmitBank,
}: Props) => {
    const renderBank = () => {
        if (paymentMethod === 'ATM')
            return (
                <div style={{ marginBottom: 15 }}>
                    <p>Chọn ngân hàng để thanh toán</p>
                    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        <Row gutter={[8, 8]} style={{ margin: 0 }}>
                            {listBank().map((item) => {
                                return (
                                    <Col span={8} key={item.code}>
                                        <div
                                            className={bankCode === item.code ? 'bank-code active' : 'bank-code'}
                                            onClick={() => setBankCode(item.code)}
                                        >
                                            <Image
                                                alt={item.name}
                                                objectFit="cover"
                                                src={`https://s3.kstorage.vn/qrpayment/bankcode/${item.code}.png`}
                                                height={60}
                                                width={80}
                                            />
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </div>
                </div>
            );
        if (paymentMethod === 'CC')
            return (
                <div style={{ marginBottom: 15 }}>
                    <p>Chọn loại thẻ để thanh toán</p>
                    <Row gutter={[8, 8]}>
                        {listVisa().map((item) => {
                            return (
                                <Col span={8} key={item.code}>
                                    <div
                                        className={bankCode === item.code ? 'bank-code active' : 'bank-code'}
                                        onClick={() => setBankCode(item.code)}
                                    >
                                        <Image
                                            alt={item.name}
                                            objectFit="cover"
                                            src={`https://s3.kstorage.vn/qrpayment/bankcode/${item.code}.png`}
                                            height={60}
                                            width={80}
                                        />
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
            );
        return null;
    };

    return (
        <Modal isShowModal={isShowBankModal} hideModal={() => setIsShowBankModal(false)}>
            {renderBank()}
            <Button
                loading={loading}
                className="btn-border"
                size="large"
                icon={<CreditCardOutlined />}
                block
                type="primary"
                onClick={onSubmitBank}
            >
                Thanh toán
            </Button>
        </Modal>
    );
};

export default BankModal;
