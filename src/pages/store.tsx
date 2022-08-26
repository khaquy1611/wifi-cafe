import React, { useState, useEffect } from 'react';
import CustomError from 'pages/_error';
import wrapper from 'reduxStore';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getClientCategory } from 'reduxStore/clientCategory/actions';
import { ClientCategoryType } from 'reduxStore/clientCategory/types';
import { getClientProducts } from 'reduxStore/clientProducts/actions';
import { ClientProductsType } from 'reduxStore/clientProducts/types';
import { getClientStoreInfo } from 'reduxStore/clientStoreInfo/actions';
import { ClientStoreInfoType } from 'reduxStore/clientStoreInfo/types';
import { detectLocationID } from 'reduxStore/bookingProducts/actions';
import { ErrorType } from 'api/types';
import { Row, Col, Modal, message as messageAntd, Badge, Button, Affix, Drawer } from 'antd';
import { PhoneOutlined, CreditCardOutlined, ShoppingOutlined } from '@ant-design/icons';
import useSocket from 'api/socket';
import Header from 'components/client/home/Header';
import Product from 'components/client/home/Product';
import Booking from 'components/bookingDrawer';

interface PropsType {
    clientStoreInfo: ClientStoreInfoType;
    clientCategory: ClientCategoryType;
    clientProducts: ClientProductsType;
    error: ErrorType;
    qrCode: string;
}

const Index = (props: PropsType) => {
    const {
        clientStoreInfo: {
            result: { data: serverDataClientStoreInfo },
        },
        clientCategory: {
            result: { data: serverDataClientCategory },
        },
        clientProducts: {
            result: { data: serverDataClientProducts },
        },
        error: { errorCode, message } = {},
        clientStoreInfo,
        qrCode,
    } = props;

    const socket = useSocket();

    if (errorCode) {
        return <CustomError message={message} />;
    }

    const dispatch = useDispatch();

    const { result } = useSelector((state: ApplicationState) => state.bookingProducts);

    useEffect(() => {
        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (qrCode !== result.locationdID) {
            dispatch(detectLocationID(qrCode));
        }
    }, [result.locationdID]);

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const showModal = (event: 'service' | 'payment') => {
        setIsModalVisible(true);
        setTimeout(() => {
            socket.emit('requestOrder', {
                room: serverDataClientStoreInfo?.store._id,
                table: serverDataClientStoreInfo?.sub_deparment._id,
                request: `${serverDataClientStoreInfo?.sub_deparment.name} ${
                    serverDataClientStoreInfo?.deparment.name
                } gọi ${event === 'service' ? 'phục vụ' : 'thanh toán'}`,
                action: event === 'service' ? 'Gọi phục vụ' : 'Gọi thanh toán',
                icon: event === 'service' ? 'service' : 'payment',
            });
            setIsModalVisible(false);
            messageAntd.info('Đã liên hệ với nhân viên phục vụ, khách vui lòng chờ để được phục vụ!', 3);
        }, 3000);
    };

    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');

    const products = serverDataClientProducts?.filter((item) => {
        if (filter === 'all') return item?.name?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
        return item.category_id === filter && item?.name?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
    });

    const [visibleDrawer, setVisibleDrawer] = useState(false);
    const showDrawer = () => {
        setVisibleDrawer(true);
        document.body.classList.remove('closeDrawer');
    };
    const onCloseDrawer = () => {
        setVisibleDrawer(false);
        document.body.classList.add('closeDrawer');
    };

    const isBrowser = typeof window !== 'undefined';
    const [windowSize] = useState({
        width: isBrowser ? window.innerWidth : 0,
        height: isBrowser ? window.innerHeight : 0,
    });

    useEffect(() => {
        if (visibleDrawer) {
            document.getElementById('paymentMethods')?.scrollIntoView();
        }
    }, [visibleDrawer]);

    return (
        <section className="container home-page-product">
            <Header
                category={serverDataClientCategory}
                options={
                    serverDataClientProducts?.map((item) => ({
                        value: item.name || '',
                        label: item.name || '',
                    })) || []
                }
                search={search}
                setSearch={(value) => setSearch(value)}
                filter={filter}
                setFilter={(value) => setFilter(value)}
            />
            <main>
                <Product
                    setBuyNow
                    showDrawer={showDrawer}
                    layout={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 5, xl: 6, xxl: 7 }}
                    products={products}
                />
            </main>
            <footer className="page-home-footer">
                <div className="page-home-footer-list-menu">
                    <Row>
                        <Col span={12}>
                            <Button
                                onClick={() => showModal('service')}
                                type="primary"
                                block
                                size="large"
                                icon={<PhoneOutlined />}
                                className="no-border-radius"
                            >
                                Gọi phục vụ
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                danger
                                onClick={() => showModal('payment')}
                                block
                                size="large"
                                icon={<CreditCardOutlined />}
                                className="no-border-radius"
                            >
                                Gọi thanh toán
                            </Button>
                        </Col>
                    </Row>
                </div>
            </footer>
            <Affix style={{ position: 'fixed', bottom: 100, right: 12, zIndex: 1000 }}>
                <Button
                    style={{ width: 56, height: 56 }}
                    type="primary"
                    shape="circle"
                    size="large"
                    className="btn-booking"
                    // onClick={() => router.push(`/booking`)}
                    onClick={showDrawer}
                >
                    <Badge count={result.locationdID === qrCode ? result.client?.length : 0}>
                        <ShoppingOutlined className="btn-booking-icon" />
                    </Badge>
                </Button>
            </Affix>
            <Modal visible={isModalVisible} footer={null} closable={false} centered width={320}>
                <div className="box-ring">
                    <div className="box-ring-phone">
                        <i className="Phone is-animating" />
                    </div>
                    <div className="box-ring-phone-des">Đang gọi nhân viên phục vụ</div>
                </div>
            </Modal>
            <Drawer
                placement="right"
                closable={false}
                onClose={onCloseDrawer}
                visible={visibleDrawer}
                width={windowSize.width <= 500 ? '100%' : 400}
                bodyStyle={{ padding: 0 }}
            >
                <Booking
                    qrCode={qrCode}
                    store="EWALLET"
                    onHide={onCloseDrawer}
                    socket={socket}
                    clientStoreInfo={clientStoreInfo}
                />
            </Drawer>
        </section>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const { store, query } = context;
    const qrCode = query.q as string;
    if (!qrCode) {
        return {
            props: {
                clientStoreInfo: store.getState().clientStoreInfo,
                clientCategory: store.getState().clientCategory,
                clientProducts: store.getState().clientProducts,
                error: { errorCode: 400, message: 'Vui lòng quét mã QR Code để sử dụng dịch vụ tại quán' },
            },
        };
    }

    await store.dispatch(getClientStoreInfo(qrCode));
    await store.dispatch(getClientCategory(qrCode));
    await store.dispatch(getClientProducts(qrCode));

    const { error: errorClientStoreInfo } = store.getState().clientStoreInfo;

    const { error: errorClientCategory } = store.getState().clientCategory;

    const { error: errorClientProducts } = store.getState().clientProducts;

    return {
        props: {
            clientStoreInfo: store.getState().clientStoreInfo,
            clientCategory: store.getState().clientCategory,
            clientProducts: store.getState().clientProducts,
            error: { ...errorClientStoreInfo, ...errorClientCategory, ...errorClientProducts },
            qrCode,
        },
    };
});

export default Index;
