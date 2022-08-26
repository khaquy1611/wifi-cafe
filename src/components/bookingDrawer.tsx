import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ApplicationState } from 'reduxStore/store';
import { useDispatch, useSelector } from 'react-redux';
import { ClientStoreInfoType } from 'reduxStore/clientStoreInfo/types';
import { resetBookingProduct } from 'reduxStore/bookingProducts/actions';
import { createProductsOrderApi } from 'api/client';
import { CheckCouponStatusDataResponseType, OrdersDataType } from 'api/types';
import { Button, PageHeader, Result, message as messageAntd, Affix, notification, Alert } from 'antd';
import { CloseOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { isEmpty, sortBy } from 'lodash';
import CartProduct from 'components/client/cart/CartProduct';
import CouponInput from 'components/client/cart/CouponInput';
import TotalPrice from 'components/client/cart/TotalPrice';
import CartInfoPayment from 'components/client/cart/CartInfoPayment';
import BankModal from 'components/BankModal';
import { alphabeticalSortedQuery } from 'common';
import ModalQRPayment from './ModalQRPayment';

interface PropsType {
    onHide: () => void;
    clientStoreInfo: ClientStoreInfoType;
    socket: SocketIOClient.Socket;
    store?: string;
    qrCode: string;
}

const Index = (props: PropsType) => {
    const {
        clientStoreInfo: {
            result: { data: serverDataClientStoreInfo },
        },
        onHide,
        socket,
        store,
        qrCode,
    } = props;

    const [c, setC] = useState<string>('');
    const [t, setT] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const [couponValue, setCouponValue] = useState<CheckCouponStatusDataResponseType>();
    const [isModalQRPayment, setIsModalQRPayment] = useState<boolean>(false);
    const [cardData, setCardData] = useState<OrdersDataType>();

    useEffect(() => {
        if (c)
            (async function immediatelyInvokedFunction() {
                try {
                    const { data } = await createProductsOrderApi({
                        qr_code: qrCode,
                        list_products: sortBy(
                            result.client.map((item) => ({
                                product_id: item._id,
                                name: item.name,
                                logo: item.logo,
                                quantity: item.quantity,
                                price: item.price,
                                ...(item.note ? { note: item.note } : null),
                            })),
                            (item) => item.name,
                        ),
                        total: result.client.reduce(
                            (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                            0,
                        ),
                        payment_method: paymentMethod,
                        bank_code: paymentMethod === 'EWALLET' ? 'APPOTA' : bankCode,
                        status_order: statusAction ? 'take-away' : 'at-place',
                        agent: window.navigator.userAgent,
                        c,
                        t,
                        ...(couponValue
                            ? {
                                  discount_amount: couponValue.discount_amount,
                                  discount_code: couponValue.discount_code,
                                  discount_id: couponValue.discount_id,
                                  discount_name: couponValue.discount_name,
                              }
                            : {}),
                        ...(store
                            ? {
                                  store_in_app: paymentMethod,
                              }
                            : {}),
                    });
                    socket.emit('notifyOrder', {
                        room: serverDataClientStoreInfo?.store._id,
                        message: `${serverDataClientStoreInfo?.sub_deparment.name} ${serverDataClientStoreInfo?.deparment.name} đã đặt hàng`,
                        icon: 'booking',
                        orderId: data._id,
                        order_id: data.id,
                    });
                    if (store && (paymentMethod === 'EWALLET' || paymentMethod === 'CC')) {
                        setCardData(data);
                        setIsModalQRPayment(true);
                    } else if (
                        data.payment_url &&
                        (paymentMethod === 'ATM' || paymentMethod === 'CC' || paymentMethod === 'EWALLET')
                    ) {
                        if (store) {
                            window.open(data.payment_url);
                        } else {
                            window.location.href = data.payment_url;
                        }
                    }
                    onHide();
                    setLoading(false);
                    setIsShowModal(false);
                    notification.success({
                        message: 'Đặt món thành công',
                        description: `Số thẻ nhận đồ của quý khách là ${data.order_code}`,
                    });
                    setBankCode('');
                    dispatch(resetBookingProduct());
                } catch (err) {
                    setLoading(false);
                    messageAntd.error((err as Error).message);
                }
            })();
    }, [c]);

    const dispatch = useDispatch();

    const { result } = useSelector((state: ApplicationState) => state.bookingProducts);

    const [isShowModal, setIsShowModal] = useState<boolean>(false);

    const [statusAction, setStatusAction] = useState<boolean>(false);

    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const [bankCode, setBankCode] = useState<string>('');

    useEffect(() => {
        if (serverDataClientStoreInfo && serverDataClientStoreInfo?.payment_method.length > 0) {
            setPaymentMethod(`${serverDataClientStoreInfo?.payment_method[0].code}`);
        }
        socket.on('cookie_order', async (c: string) => {
            setC(c);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    const onSubmit = async () => {
        if (paymentMethod === 'ATM' || paymentMethod === 'CC') {
            if (!bankCode) {
                messageAntd.warning('Vui lòng chọn ngân hàng / thẻ để thanh toán');
                return;
            }
        }
        const t = Date.now();

        setLoading(true);

        setT(t);

        socket.emit('cookieOrder', {
            data: alphabeticalSortedQuery({
                qr_code: qrCode,
                list_products: sortBy(
                    result.client.map((item) => ({
                        product_id: item._id,
                        name: item.name,
                        logo: item.logo,
                        quantity: item.quantity,
                        price: item.price,
                        ...(item.note ? { note: item.note } : null),
                    })),
                    (item) => item.name,
                ),
                total: result.client.reduce(
                    (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                    0,
                ),
                payment_method: paymentMethod,
                bank_code: paymentMethod === 'EWALLET' ? 'APPOTA' : bankCode,
                status_order: statusAction ? 'take-away' : 'at-place',
                agent: window.navigator.userAgent,
                t,
                ...(couponValue
                    ? {
                          discount_amount: couponValue.discount_amount,
                          discount_code: couponValue.discount_code,
                          discount_id: couponValue.discount_id,
                          discount_name: couponValue.discount_name,
                      }
                    : {}),
                ...(store
                    ? {
                          store_in_app: paymentMethod,
                      }
                    : {}),
            }),
        });
    };

    const showModal = async () => {
        try {
            if (!paymentMethod) {
                messageAntd.warning('Vui lòng chọn hình thức thanh toán');
                return;
            }
            if (paymentMethod === 'ATM' || paymentMethod === 'CC') {
                setIsShowModal(!isShowModal);
                return;
            }
            onSubmit();
        } catch (err) {
            messageAntd.error((err as Error).message);
        }
    };

    const totalMoney = result.client.reduce(
        (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
        0,
    );

    const onChangeMethodPayment = (e: RadioChangeEvent) => {
        setPaymentMethod(e.target.value);
    };

    return (
        <section className="container" style={{ backgroundColor: '#fff', position: 'relative' }}>
            <div className="page-cart-header">
                <PageHeader title="Giỏ hàng" />
                <Button onClick={onHide} type="default" shape="circle" icon={<CloseOutlined />} />
            </div>
            <main className="mainBooking">
                {result.locationdID === qrCode && !isEmpty(result.client) ? (
                    <>
                        <div className="modal-order-product-box">
                            <div className="box-info">
                                <div className="header-info">
                                    <div className="header-info-title">Các món đã chọn</div>
                                </div>
                                <div className="content-info">
                                    <CartProduct listProducts={result.client} />
                                </div>
                            </div>
                            <div className="box-info">
                                <div className="header-info">
                                    <div className="header-info-title">Tổng cộng</div>
                                </div>
                                <div className="content-info">
                                    <CouponInput
                                        listProducts={result.client}
                                        couponValue={couponValue}
                                        setCouponValue={setCouponValue}
                                        group_id_Prop={serverDataClientStoreInfo?.store.group_id}
                                        store_id_Prop={serverDataClientStoreInfo?.store._id}
                                    />
                                    <TotalPrice
                                        couponValue={couponValue?.discount_amount || 0}
                                        totalMoney={totalMoney}
                                    />
                                </div>
                            </div>
                            <div className="box-info">
                                {serverDataClientStoreInfo && serverDataClientStoreInfo?.payment_method.length > 0 ? (
                                    <>
                                        <div className="header-info">
                                            <div className="header-info-title" id="paymentMethods">
                                                Thanh toán
                                            </div>
                                        </div>
                                        <div className="content-info">
                                            <CartInfoPayment
                                                hiddenTakeAway
                                                paymentMethodValue={paymentMethod}
                                                paymentMethod={serverDataClientStoreInfo?.payment_method}
                                                statusActionValue={statusAction}
                                                onChangeStatusAction={setStatusAction}
                                                onChangeMethodPayment={(event) => onChangeMethodPayment(event)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <Alert
                                        message="Quý khách vui lòng liên hệ với nhân viên để thêm phương thức thanh toán"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </div>
                        </div>
                        <Affix offsetBottom={0}>
                            <Button
                                loading={loading}
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                block
                                type="primary"
                                onClick={showModal}
                                className="no-border-radius"
                            >
                                Tiếp tục
                            </Button>
                        </Affix>
                    </>
                ) : (
                    <Result
                        style={{ minHeight: 'calc(100vh - 64px)' }}
                        className="web-admin-result-sidebar"
                        icon={
                            <Image
                                width={256}
                                height={256}
                                objectFit="cover"
                                quality={100}
                                src="https://s3.kstorage.vn/qrpayment/common/cart-empty.png"
                            />
                        }
                        title="Chưa có mặt hàng nào"
                    />
                )}
            </main>
            <BankModal
                loading={loading}
                paymentMethod={paymentMethod}
                bankCode={bankCode}
                setBankCode={setBankCode}
                isShowBankModal={isShowModal}
                setIsShowBankModal={setIsShowModal}
                onSubmitBank={onSubmit}
            />
            {cardData && isModalQRPayment && (
                <ModalQRPayment
                    isModalVisible={isModalQRPayment}
                    setIsModalVisible={setIsModalQRPayment}
                    paymentMethod={paymentMethod}
                    card={cardData}
                />
            )}
        </section>
    );
};

export default Index;
