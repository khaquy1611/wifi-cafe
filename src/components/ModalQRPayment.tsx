import React, { useState, useEffect } from 'react';
import { Button, Image, Modal, Space, Typography } from 'antd';
import { OrdersDataType } from 'api/types';
import QRCode from 'qrcode.react';

const { Text, Title } = Typography;

type IProps = {
    isModalVisible: boolean;
    setIsModalVisible: (isModalVisible: boolean) => void;
    card: OrdersDataType;
    paymentMethod: string;
};

const ModalQRPayment = ({ isModalVisible, setIsModalVisible, card, paymentMethod }: IProps) => {
    const [counter, setCounter] = useState(60);

    useEffect(() => {
        if (counter > 0) {
            setTimeout(() => setCounter(counter - 1), 1000);
        } else if (counter === 0) {
            setIsModalVisible(false);
        }
    }, [counter]);

    const handleClose = () => {
        setIsModalVisible(false);
    };

    return (
        <Modal
            title={
                <div>
                    Thanh toán đơn hàng <a>{card?.id}</a>
                </div>
            }
            visible={isModalVisible}
            okText="Đóng"
            footer={
                <Button type="primary" key="submit" onClick={handleClose}>
                    Đóng
                </Button>
            }
        >
            <div className="modal-payment-qr">
                {card?.payment_url ? (
                    <Space direction="vertical">
                        <Space>
                            <Text type="secondary">Tổng thanh toán:</Text>
                            <Title level={4} className="margin-bottom-0">
                                {card?.discount_amount
                                    ? (Number(card?.total) - card.discount_amount).toLocaleString('en-AU')
                                    : Number(card?.total).toLocaleString('en-AU')}{' '}
                                ₫
                            </Title>
                        </Space>
                        {paymentMethod === 'CC' ? (
                            <>
                                <Text>Vui lòng sử dụng camera để quét mã thanh toán</Text>
                                <QRCode includeMargin size={256} fgColor="#0fa44a" value={card?.payment_url} />
                                <span>Thanh toán trong {counter}s</span>
                            </>
                        ) : (
                            <>
                                <Text>
                                    Vui lòng sử dụng ứng dụng Ví Appota hoặc ứng dụng ngân hàng để quét mã thanh toán
                                </Text>
                                <Image src={card?.payment_url} preview={false} width={250} height={250} />
                                <span>Thanh toán trong {counter}s</span>
                            </>
                        )}
                    </Space>
                ) : (
                    <Text>Không có link thanh toán</Text>
                )}
            </div>
        </Modal>
    );
};

export default ModalQRPayment;
