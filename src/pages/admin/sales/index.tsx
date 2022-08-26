import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getDepartment } from 'reduxStore/department/actions';
import { getCategory } from 'reduxStore/category/actions';
import { getProducts } from 'reduxStore/products/actions';
import { getOrders } from 'reduxStore/orders/actions';
import { getPaymentMethods } from 'reduxStore/paymentMethods/actions';
import { getNotification } from 'reduxStore/notification/actions';
import { addCard, deleteCard, chooseCardStatusOrder, setAllCards, setCard } from 'reduxStore/cardTabs/actions';
import { getOrderDetailApi } from 'api/store';
import { Button, Tabs, Empty, notification, Affix, message as messageAntd } from 'antd';
import { AlertOutlined, PlusOutlined } from '@ant-design/icons';
import useSocket from 'api/socket';
import HeaderAdmin from 'components/admin/Header';
import CartCMS from 'components/admin/sales/CartCMS';
import SubDepartmentTab from 'components/admin/sales/SubDepartmentTab';
import ProductsTab from 'components/admin/sales/ProductsTab';
import OrdersTab from 'components/admin/sales/OrdersTab';
import { parseCookies } from 'nookies';
import { findLast } from 'lodash';
// import { ErrorType } from 'api/types';

const { TabPane } = Tabs;

const Index = () => {
    const socket = useSocket();

    const dispatch = useDispatch();
    const { group_id, store_id } = parseCookies();

    const {
        result: { data: dataDepartment },
        loading: loadingOrder,
    } = useSelector((state: ApplicationState) => state.department);

    const {
        result: { data: dataOrders },
    } = useSelector((state: ApplicationState) => state.orders);

    const {
        result: { cards },
    } = useSelector((state: ApplicationState) => state.cardTabs);

    const {
        result: { data: dataCateGory },
    } = useSelector((state: ApplicationState) => state.category);

    const {
        result: { data: dataProduct },
    } = useSelector((state: ApplicationState) => state.products);

    const {
        result: { data: dataPaymentMethods },
    } = useSelector((state: ApplicationState) => state.paymentMethods);

    useEffect(() => {
        dispatch(getNotification(group_id, store_id));
        if (socket) {
            socket.emit('requestOrder', { room: store_id });
            socket.on(
                'message',
                async ({
                    message,
                    orderId,
                    order_id,
                    type,
                }: {
                    message: string;
                    orderId: string;
                    order_id: string;
                    type?: string;
                }) => {
                    if (message) {
                        let audioMp3 = 'https://s3.kstorage.vn/qrpayment/common/pristine-609.mp3';
                        if (type === 'paymented') {
                            audioMp3 = 'https://s3.kstorage.vn/qrpayment/common/slow-spring-board-570.mp3';
                        }
                        const audio = new Audio(audioMp3);
                        audio.play();
                        openNotification(message);
                        if (orderId && order_id) await handleOrderDetail(orderId, order_id, 'socket');
                    }
                    dispatch(getDepartment(group_id, store_id));
                    dispatch(getOrders(group_id, store_id));
                    dispatch(getNotification(group_id, store_id));
                },
            );
        }
    }, [socket]);

    useEffect(() => {
        return () => {
            socket.disconnect();
            dispatch(setAllCards());
        };
    }, []);

    useEffect(() => {
        dispatch(getOrders(group_id, store_id));
        dispatch(getCategory(group_id, store_id));
        dispatch(getDepartment(group_id, store_id));
        dispatch(getProducts(group_id, store_id));
        dispatch(getPaymentMethods(group_id, store_id));
    }, []);
    const openNotification = (message: string) => {
        const key = `open${Date.now()}`;
        notification.open({
            message: 'Bạn có tin nhắn.',
            icon: <AlertOutlined />,
            description: message,
            key,
            // ...(orderId
            //     ? {
            //           onClick: () => {
            //               setChangeTab('3');
            //               handleOrderDetail(orderId);
            //           },
            //       }
            //     : null),
        });
    };

    const [loading, setLoading] = useState<boolean>(false);

    const [showCart, setShowCart] = useState<boolean>(false);
    const [changeTab, setChangeTab] = useState<string>('1');

    const handleOrderDetail = async (orderID: string, order_id?: string, type?: string) => {
        try {
            setShowCart(true);
            if (type && order_id) {
                const {
                    data: { list_products, id, sub_department_id, payment_method, status_order, bank_code, status },
                    data,
                } = await getOrderDetailApi(orderID, group_id, store_id);
                if (status === 'pending' || status === 'processing') {
                    dispatch(
                        setCard({
                            orderId: order_id,
                            card: {
                                ...data,
                                orderId: id,
                                listProducts: list_products,
                                tableState: sub_department_id,
                                statusAction: status_order === 'take-away',
                                paymentMethod: payment_method,
                                bankUrl: bank_code,
                            },
                        }),
                    );
                    setActiveKeyState(order_id);
                }
                return;
            }
            const res = cards.find((item) => item._id === orderID);
            if (order_id && res) {
                const {
                    data: { list_products, id, sub_department_id, payment_method, status_order, bank_code },
                    data,
                } = await getOrderDetailApi(orderID, group_id, store_id);
                dispatch(
                    setCard({
                        orderId: order_id,
                        card: {
                            ...data,
                            orderId: id,
                            listProducts: list_products,
                            tableState: sub_department_id,
                            statusAction: status_order === 'take-away',
                            paymentMethod: payment_method,
                            bankUrl: bank_code,
                        },
                    }),
                );
                setActiveKeyState(order_id);
                return;
            }
            setLoading(true);
            const {
                data: { list_products, id, sub_department_id, payment_method, status_order, _id },
                data,
            } = await getOrderDetailApi(orderID, group_id, store_id);
            setActiveKeyState(id);
            dispatch(
                addCard({
                    ...data,
                    _id,
                    orderId: id,
                    listProducts: list_products,
                    tableState: sub_department_id,
                    statusAction: status_order === 'take-away',
                    paymentMethod: payment_method,
                    bankUrl: '',
                }),
            );

            setLoading(false);
        } catch (err) {
            setLoading(false);
            messageAntd.error((err as Error).message);
        }
    };

    const [panes, setPanes] = useState<
        { title: string; content: React.ReactElement; key: string; closable: boolean }[] | undefined
    >(undefined);

    const [activeKeyState, setActiveKeyState] = useState<string>(cards[0].orderId);

    useEffect(() => {
        setPanes(
            cards.map((item) => ({
                title: item.orderId,
                content: (
                    <CartCMS
                        orderId={item.orderId}
                        panes={panes}
                        activeKeyState={activeKeyState}
                        setActiveKeyState={setActiveKeyState}
                        setChangeTab={setChangeTab}
                        serverDataDepartment={dataDepartment}
                        socket={socket}
                        loading={loading}
                        serverDataPaymentMethods={dataPaymentMethods}
                        statusAction={item.statusAction}
                        setStatusAction={(value) =>
                            dispatch(chooseCardStatusOrder({ orderId: item.orderId, statusOrder: value }))
                        }
                    />
                ),
                key: item.orderId,
                closable: !!item.orderId,
            })),
        );
    }, [cards, loading, activeKeyState, dataDepartment]);

    const onTabChange = async (activeKey: string) => {
        const res: any = cards.find((item) => item.id === activeKey);
        if (res) {
            const {
                data: { list_products, id, sub_department_id, payment_method, status_order, bank_code },
                data,
            } = await getOrderDetailApi(res._id, group_id, store_id);
            dispatch(
                setCard({
                    orderId: activeKey,
                    card: {
                        ...data,
                        orderId: id,
                        listProducts: list_products,
                        tableState: sub_department_id,
                        statusAction: status_order === 'take-away',
                        paymentMethod: payment_method,
                        bankUrl: bank_code,
                    },
                }),
            );
        }
        setActiveKeyState(activeKey);
    };

    const onTabEdit = (
        targetKey: string | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') addTab();
        if (action === 'remove') removeTab(targetKey);
    };

    const addTab = () => {
        const lastNewCard = findLast(panes, (item) => item.key.includes('Đơn mới'));
        const lastNewCardOrderId = lastNewCard?.key.split(' ')[2];
        if (lastNewCard) {
            setActiveKeyState(`Đơn mới ${Number(lastNewCardOrderId || 0) + 1}`);
        } else {
            setActiveKeyState('Đơn mới');
        }
        dispatch(addCard());
    };

    const removeTab = (targetKey: string | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => {
        if (cards.length === 1) {
            setActiveKeyState('Đơn mới');
            setShowCart(false);
        } else {
            let newActiveKey = activeKeyState;
            let lastIndex;
            panes?.forEach((pane, i) => {
                if (pane.key === targetKey) {
                    lastIndex = i - 1;
                }
            });
            const newPanes = panes?.filter((pane) => pane.key !== targetKey);
            if (newPanes?.length && newActiveKey === targetKey) {
                if (lastIndex && lastIndex >= 0) {
                    newActiveKey = newPanes[lastIndex].key;
                } else {
                    newActiveKey = newPanes[0].key;
                }
            }
            setActiveKeyState(newActiveKey);
        }
        dispatch(deleteCard(`${targetKey}`));
    };

    return (
        <>
            <HeaderAdmin socket={socket} handleOrderDetail={handleOrderDetail} />
            <div className="bxShop">
                <div className="bxShop_Left">
                    <Affix offsetTop={64}>
                        {showCart ? (
                            <div className="sale-card-tabs">
                                <Tabs
                                    type="editable-card"
                                    onChange={onTabChange}
                                    activeKey={activeKeyState}
                                    onEdit={onTabEdit}
                                    className="tabMenu"
                                >
                                    {panes?.map((item) => (
                                        <TabPane
                                            className="tabMenu_Item"
                                            tab={item.title}
                                            key={item.key}
                                            closable={item.closable}
                                        >
                                            {item.content}
                                        </TabPane>
                                    ))}
                                </Tabs>
                            </div>
                        ) : (
                            <Empty
                                className="empty-cart"
                                image="https://s3.kstorage.vn/qrpayment/common/purchase-order.png"
                                imageStyle={{
                                    height: '50%',
                                }}
                                description={<h2>Đơn hàng trống</h2>}
                            >
                                <Button icon={<PlusOutlined />} type="primary" onClick={() => setShowCart(true)}>
                                    Thêm đơn hàng
                                </Button>
                            </Empty>
                        )}
                    </Affix>
                </div>
                <div className="bxShop_Right">
                    <main className="web-admin-main-order">
                        <Tabs
                            className="tabList"
                            defaultActiveKey={changeTab}
                            activeKey={changeTab}
                            onChange={setChangeTab}
                        >
                            <TabPane className="tabPane tabList_Orders" tab="Danh sách đơn" key="1">
                                <OrdersTab
                                    orderId={activeKeyState}
                                    ordersData={dataOrders}
                                    loadingOrder={loadingOrder}
                                    handleOrderDetail={handleOrderDetail}
                                />
                            </TabPane>
                            <TabPane className="tabPane tabList_Department" tab="Danh sách bàn" key="2">
                                <SubDepartmentTab
                                    orderId={activeKeyState}
                                    options={dataDepartment}
                                    tablesData={dataDepartment}
                                    setChangeTab={setChangeTab}
                                    handleOrderDetail={handleOrderDetail}
                                    socket={socket}
                                    statusAction={false}
                                    setShowCart={setShowCart}
                                />
                            </TabPane>
                            <TabPane className="tabPane tabList_Category" tab="Danh sách món" key="3">
                                <ProductsTab
                                    orderId={activeKeyState}
                                    categoryData={dataCateGory}
                                    productsData={dataProduct}
                                    setShowCart={setShowCart}
                                />
                            </TabPane>
                        </Tabs>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Index;
