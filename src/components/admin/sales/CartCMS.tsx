import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getDepartment } from 'reduxStore/department/actions';
import { getOrders } from 'reduxStore/orders/actions';
import QRCode from 'qrcode.react';
import { chooseCardPaymentMethod, setCard, setCardCreated, deleteCard } from 'reduxStore/cardTabs/actions';
import { Form, Input, Button, Modal, Spin, Space, message as messageAntd } from 'antd';
import {
    DepartmentDataType,
    PaymentMethodDataType,
    CreateProductsOrderResponeType,
    CheckCouponStatusDataResponseType,
    SubDepartmentDataType,
} from 'api/types';
import { PrinterOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import CustomerInput from 'components/admin/CustomerInput';
import CustomModal from 'components/admin/Modal';
import CartProduct from 'components/client/cart/CartProduct';
import CouponInput from 'components/client/cart/CouponInput';
import TotalPrice from 'components/client/cart/TotalPrice';
import CartInfoPayment from 'components/client/cart/CartInfoPayment';
import PriceCalculator from 'components/client/cart/PriceCalculator';
import PrintOrder from 'components/client/cart/PrintOrder';
import BankModal from 'components/BankModal';
import { createProductsOrderByAdminApi, updateProductsOrderApi } from 'api/client';
import { changeOrderStatusApi, getOrderDetailApi, changeReceivedProduct, changeTablesApi } from 'api/store';
import { parseCookies } from 'nookies';
import { useReactToPrint } from 'react-to-print';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import Table from './components/Table';
import HeaderOrderTab from './components/HeaderOrderTab';
import FooterButtonSubmit from './components/FooterButtonSubmit';

interface Props {
    orderId: string;
    panes?: { title: string; content: React.ReactElement; key: string; closable: boolean }[];
    activeKeyState: string;
    setActiveKeyState: (value: string) => void;
    setChangeTab: (value: string) => void;
    serverDataDepartment?: DepartmentDataType[];
    socket: SocketIOClient.Socket;
    loading: boolean;
    serverDataPaymentMethods?: PaymentMethodDataType[];
    statusAction: boolean;
    setStatusAction: (value: boolean) => void;
}

const CartCMS = ({
    orderId,
    panes,
    activeKeyState,
    setActiveKeyState,
    setChangeTab,
    serverDataDepartment,
    socket,
    loading,
    serverDataPaymentMethods,
    statusAction,
    setStatusAction,
}: Props) => {
    const dispatch = useDispatch();

    const { group_id, store_id, group_ws, admin_name } = parseCookies();

    const {
        result: { cards },
    } = useSelector((state: ApplicationState) => state.cardTabs);
    const card = cards.find((item) => item.orderId === orderId);

    const [form] = Form.useForm();

    const [phoneNumber, setPhoneNumber] = useState<string | undefined>(card?.customer_phone_number);
    const [customerId, setCustomerId] = useState<string | undefined>(card?.customer_id);
    // const [bankUrl, setBankUrl] = useState<string>('');
    const [clientMoney, setClientMoney] = useState<string>('0');
    const [loadingPayment, setLoadingPayment] = useState<boolean>(false);
    const [loadingSave, setLoadingSave] = useState<boolean>(false);
    const [isShowModal, setIsShowModal] = useState<boolean>(false);

    const [cancelOrder, setCancelOrder] = useState<string>('');
    const [visible, setVisible] = useState<number>(1);
    const [department_table, setDepartmentTable] = useState<{ sub_department_id: string; department_id: string }>({
        department_id: '',
        sub_department_id: '',
    });
    const [tickTable, settickTable] = useState<string>('');
    const listErrCancelOrder = ['Khách huỷ đơn', 'Khách chưa thanh toán'];

    const handleModal = () => {
        setIsShowModal((prevIsShowModal) => !prevIsShowModal);
    };

    useEffect(() => {
        form.resetFields();
    }, [isShowModal]);

    const [containerCart, setContainerCart] = useState<HTMLDivElement | null>(null);

    const [isShowBankModal, setIsShowBankModal] = useState<boolean>(false);
    const [bankCode, setBankCode] = useState<string>('');

    const [couponState, setCouponState] = useState<CheckCouponStatusDataResponseType | undefined>({
        discount_amount: card?.discount_amount || 0,
        discount_code: card?.discount_code || '',
        discount_id: card?.discount_id || '',
        discount_name: card?.discount_name || '',
    });

    const reloadDataOrder = async () => {
        const {
            data: {
                bank_code,
                payment_method,
                status_order,
                list_products,
                sub_department_id,
                id,
                status_payment,
                status_service,
                status,
            },
            data,
        } = await getOrderDetailApi(`${card?._id}`, group_id, store_id);
        dispatch(
            setCard({
                orderId,
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
        socket.emit('staffOnWeb', { room: store_id });
        dispatch(getDepartment(group_id, store_id));
        dispatch(getOrders(group_id, store_id));

        if (status_payment === 'completed' && status_service === 'completed') {
            if (cards.length === 1) {
                setActiveKeyState('Đơn mới');
            } else {
                let newActiveKey = activeKeyState;
                let lastIndex;
                panes?.forEach((pane, i) => {
                    if (pane.key === orderId) {
                        lastIndex = i - 1;
                    }
                });
                const newPanes = panes?.filter((pane) => pane.key !== orderId);
                if (newPanes?.length && newActiveKey === orderId) {
                    if (lastIndex && lastIndex >= 0) {
                        newActiveKey = newPanes[lastIndex].key;
                    } else {
                        newActiveKey = newPanes[0].key;
                    }
                }
                setActiveKeyState(newActiveKey);
            }
            dispatch(deleteCard(orderId));
        }
        if (status === 'cancelled') {
            dispatch(deleteCard(orderId));
        }
        setLoadingSave(false);
        setIsShowModal(false);
    };

    const onSubmitChangeOrderStatusService = async (type: 'cancel_order' | 'complete_service' | 'complete_payment') => {
        try {
            if (type === 'cancel_order' && !cancelOrder) {
                messageAntd.warning('Vui lòng nhập lý do huỷ đơn');
                return;
            }
            setLoadingSave(true);
            const { message } = await changeOrderStatusApi(
                {
                    ...(!isEmpty(cancelOrder) ? { note: cancelOrder } : {}),
                    type,
                    group_id,
                    store_id,
                },
                `${card?._id}`,
            );
            await reloadDataOrder();
            messageAntd.success(message);
        } catch (err) {
            setLoadingSave(false);
            messageAntd.error(err.message);
        }
    };

    const onChangeMethodPayment = (e: RadioChangeEvent) => {
        dispatch(chooseCardPaymentMethod({ orderId, paymentMethod: e.target.value }));
    };

    const componentRefPreview = useRef(null);
    const handlePrintPreview = useReactToPrint({
        content: () => componentRefPreview.current,
    });

    useEffect(() => {
        if (card?.created && activeKeyState && typeof handleModalPayment === 'function') handleModalPayment(); // handle print for new created orders
    }, [card, activeKeyState]);

    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () =>
            dispatch(
                setCardCreated({
                    orderId,
                    created: false,
                }),
            ),
    });

    const handleModalPayment = () => {
        if (card?.payment_method !== 'MONEY' && card?.payment_url) {
            window.open(card?.payment_url, '_blank');
            return;
        }
        Modal.info({
            width: 767,
            icon: null,
            title: null,
            style: { top: 20 },
            content: (
                <div className="modal-payment-qrs">
                    {card?.payment_method !== 'MONEY' && card?.payment_url ? (
                        <iframe
                            style={{ height: '75vh', border: 'none' }}
                            width="100%"
                            height="100%"
                            title="Thanh toán đơn hàng"
                            src={card?.payment_url}
                        />
                    ) : (
                        <div>
                            <p>
                                Tổng thanh toán:{' '}
                                <strong>
                                    {card?.discount_amount
                                        ? (Number(card?.total) - card.discount_amount).toLocaleString('en-AU')
                                        : Number(card?.total).toLocaleString('en-AU')}{' '}
                                    Đ
                                </strong>
                            </p>
                            <p>
                                Hình thức thanh toán: <strong>{card?.payment_method_name}</strong>
                            </p>
                            {card?.payment_url && (
                                <div>
                                    <p>Vui lòng sử dụng ACheckin để quét mã thanh toán</p>
                                    <p>
                                        <QRCode
                                            includeMargin
                                            size={256}
                                            fgColor="#0fa44a"
                                            value={`acheckin://app?p=${process.env.MINIAPP_BUNDLE_ID}&wi=${group_ws}&d=${card._id}`}
                                        />
                                    </p>
                                    <Button type="link" onClick={handlePrint}>
                                        Hoặc in hoá đơn thanh toán
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ),
            onOk() {
                dispatch(
                    setCardCreated({
                        orderId,
                        created: false,
                    }),
                );
            },
        });
    };

    const onSubmitChangetables = async () => {
        try {
            setLoadingSave(true);
            const { message } = await changeTablesApi({
                group_id,
                store_id,
                order_id: card?._id as string,
                department_id: department_table.department_id,
                sub_department_id: department_table.sub_department_id,
            });
            await reloadDataOrder();
            messageAntd.success(message);
        } catch (error) {
            setLoadingSave(false);
            messageAntd.error(error.message);
        }
    };

    const onSubmitSave = async () => {
        try {
            if (!card?.tableState && !statusAction) {
                messageAntd.warning('Vui lòng chọn bàn để thanh toán');
                setChangeTab('1');
                return;
            }
            if (isEmpty(card?.listProducts)) {
                messageAntd.warning('Vui lòng chọn sản phẩm');
                setChangeTab('2');
                return;
            }
            if (!card?.paymentMethod) {
                messageAntd.warning('Vui lòng chọn hình thức thanh toán');
                return;
            }
            let res: CreateProductsOrderResponeType;
            setLoadingSave(true);
            if (card?._id) {
                res = await updateProductsOrderApi(
                    {
                        type: 'save',
                        group_id,
                        store_id,
                        list_products: sortBy(
                            card?.listProducts.map((item) => ({
                                product_id: item.product_id,
                                name: item.name,
                                logo: item.logo,
                                quantity: item.quantity,
                                price: item.price,
                                ...(item.note ? { note: item.note } : null),
                            })),
                            (item) => item.name,
                        ),
                        total:
                            card?.listProducts.reduce(
                                (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                                0,
                            ) || 0,
                        payment_method: card?.paymentMethod,
                        status_order: statusAction ? 'take-away' : 'at-place',
                        ...(!statusAction
                            ? {
                                  sub_department_id: `${
                                      serverDataDepartment
                                          ?.find((item) =>
                                              item.subDepartment.find((table) => table._id === card?.tableState),
                                          )
                                          ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                                  }`,
                              }
                            : {}),
                        ...(couponState?.discount_amount
                            ? {
                                  discount_amount: couponState?.discount_amount,
                                  discount_code: couponState?.discount_code,
                                  discount_id: couponState?.discount_id,
                                  discount_name: couponState?.discount_name,
                              }
                            : {}),
                        ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                    },
                    card?._id,
                );
                messageAntd.success('Đơn đã được cập nhật!');
            } else {
                res = await createProductsOrderByAdminApi({
                    type: 'save',
                    list_products: sortBy(
                        card?.listProducts.map((item) => ({
                            product_id: item._id,
                            name: item.name,
                            logo: item.logo,
                            quantity: item.quantity,
                            price: item.price,
                            ...(item.note ? { note: item.note } : null),
                        })),
                        (item) => item.name,
                    ),
                    total:
                        card?.listProducts.reduce(
                            (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                            0,
                        ) || 0,
                    payment_method: card?.paymentMethod,
                    status_order: statusAction ? 'take-away' : 'at-place',
                    group_id,
                    store_id,
                    ...(!statusAction
                        ? {
                              sub_department_id: `${
                                  serverDataDepartment
                                      ?.find((item) =>
                                          item.subDepartment.find((table) => table._id === card?.tableState),
                                      )
                                      ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                              }`,
                          }
                        : {}),
                    ...(couponState?.discount_amount
                        ? {
                              discount_amount: couponState?.discount_amount,
                              discount_code: couponState?.discount_code,
                              discount_id: couponState?.discount_id,
                              discount_name: couponState?.discount_name,
                          }
                        : {}),
                    ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                });
                setActiveKeyState(res.data.id);
                messageAntd.success('Tạo đơn thành công!');
            }

            dispatch(
                setCard({
                    orderId,
                    card: {
                        ...res.data,
                        orderId: res.data.id,
                        listProducts: res.data.list_products,
                        tableState: res.data.sub_department_id,
                        statusAction: res.data.status_order === 'take-away',
                        paymentMethod: res.data.payment_method,
                        bankUrl: res.data.bank_code,
                    },
                }),
            );

            socket.emit('staffOnWeb', { room: store_id });
            dispatch(getDepartment(group_id, store_id));
            dispatch(getOrders(group_id, store_id));
            setLoadingSave(false);
        } catch (err) {
            setLoadingSave(false);
            messageAntd.error(err.message);
        }
    };

    const onSubmit = async () => {
        try {
            if (!card?.tableState && !statusAction) {
                messageAntd.warning('Vui lòng chọn bàn để thanh toán');
                setChangeTab('1');
                return;
            }
            if (isEmpty(card?.listProducts)) {
                messageAntd.warning('Vui lòng chọn sản phẩm để thanh toán');
                setChangeTab('2');
                return;
            }
            if (!card?.paymentMethod) {
                messageAntd.warning('Vui lòng chọn hình thức thanh toán');
                return;
            }
            if (card?.paymentMethod === 'ATM' || card?.paymentMethod === 'CC') {
                setIsShowBankModal(true);
                return;
            }
            let res: CreateProductsOrderResponeType;
            setLoadingPayment(true);
            if (card?._id) {
                res = await updateProductsOrderApi(
                    {
                        type: 'payment',
                        group_id,
                        store_id,
                        list_products: sortBy(
                            card?.listProducts.map((item) => ({
                                product_id: item.product_id,
                                name: item.name,
                                logo: item.logo,
                                quantity: item.quantity,
                                price: item.price,
                                ...(item.note ? { note: item.note } : null),
                            })),
                            (item) => item.name,
                        ),
                        total:
                            card?.listProducts.reduce(
                                (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                                0,
                            ) || 0,
                        payment_method: card?.paymentMethod,
                        status_order: statusAction ? 'take-away' : 'at-place',
                        ...(card?.paymentMethod === 'EWALLET'
                            ? {
                                  bank_code: 'APPOTA',
                              }
                            : {}),
                        ...(!statusAction
                            ? {
                                  sub_department_id: `${
                                      serverDataDepartment
                                          ?.find((item) =>
                                              item.subDepartment.find((table) => table._id === card?.tableState),
                                          )
                                          ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                                  }`,
                              }
                            : {}),
                        ...(couponState?.discount_amount
                            ? {
                                  discount_amount: couponState?.discount_amount,
                                  discount_code: couponState?.discount_code,
                                  discount_id: couponState?.discount_id,
                                  discount_name: couponState?.discount_name,
                              }
                            : {}),
                        ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                    },
                    card?._id,
                );
                // dispatch(chooseCardTable({ orderId, tableId: res.data.sub_department_id || '' }));
                // messageAntd.success('Đơn đã được cập nhật!');
            } else {
                res = await createProductsOrderByAdminApi({
                    type: 'payment',
                    list_products: sortBy(
                        card?.listProducts.map((item) => ({
                            product_id: item._id,
                            name: item.name,
                            logo: item.logo,
                            quantity: item.quantity,
                            price: item.price,
                            ...(item.note ? { note: item.note } : null),
                        })),
                        (item) => item.name,
                    ),
                    total:
                        card?.listProducts.reduce(
                            (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                            0,
                        ) || 0,
                    payment_method: card?.paymentMethod,
                    status_order: statusAction ? 'take-away' : 'at-place',
                    ...(card?.paymentMethod === 'EWALLET'
                        ? {
                              bank_code: 'APPOTA',
                          }
                        : {}),
                    group_id,
                    store_id,
                    ...(!statusAction
                        ? {
                              sub_department_id: `${
                                  serverDataDepartment
                                      ?.find((item) =>
                                          item.subDepartment.find((table) => table._id === card?.tableState),
                                      )
                                      ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                              }`,
                          }
                        : {}),
                    ...(couponState?.discount_amount
                        ? {
                              discount_amount: couponState?.discount_amount,
                              discount_code: couponState?.discount_code,
                              discount_id: couponState?.discount_id,
                              discount_name: couponState?.discount_name,
                          }
                        : {}),
                    ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                });
                setActiveKeyState(res.data.id);
                // messageAntd.success('Tạo đơn thành công!');
            }

            dispatch(
                setCard({
                    orderId,
                    card: {
                        ...res.data,
                        orderId: res.data.id,
                        listProducts: res.data.list_products,
                        tableState: res.data.sub_department_id,
                        statusAction: res.data.status_order === 'take-away',
                        paymentMethod: res.data.payment_method,
                        bankUrl: res.data.bank_code,
                        created: true,
                    },
                }),
            );

            socket.emit('staffOnWeb', { room: store_id });
            dispatch(getDepartment(group_id, store_id));
            dispatch(getOrders(group_id, store_id));
            setLoadingPayment(false);
        } catch (err) {
            setLoadingPayment(false);
            messageAntd.error(err.message);
        }
    };

    const onSubmitBank = async () => {
        try {
            if (card?.paymentMethod === 'ATM' || card?.paymentMethod === 'CC') {
                if (!bankCode) {
                    messageAntd.warning('Vui lòng chọn ngân hàng / thẻ để thanh toán');
                    return;
                }
            }
            setLoadingPayment(true);
            let res: CreateProductsOrderResponeType;
            if (card?._id) {
                res = await updateProductsOrderApi(
                    {
                        type: 'payment',
                        group_id,
                        store_id,
                        list_products: sortBy(
                            card?.listProducts.map((item) => ({
                                product_id: item.product_id,
                                name: item.name,
                                logo: item.logo,
                                quantity: item.quantity,
                                price: item.price,
                                ...(item.note ? { note: item.note } : null),
                            })),
                            (item) => item.name,
                        ),
                        total:
                            card?.listProducts.reduce(
                                (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                                0,
                            ) || 0,
                        bank_code: bankCode,
                        payment_method: `${card?.paymentMethod}`,
                        status_order: statusAction ? 'take-away' : 'at-place',
                        ...(!statusAction
                            ? {
                                  sub_department_id: `${
                                      serverDataDepartment
                                          ?.find((item) =>
                                              item.subDepartment.find((table) => table._id === card?.tableState),
                                          )
                                          ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                                  }`,
                              }
                            : {}),
                        ...(couponState?.discount_amount
                            ? {
                                  discount_amount: couponState?.discount_amount,
                                  discount_code: couponState?.discount_code,
                                  discount_id: couponState?.discount_id,
                                  discount_name: couponState?.discount_name,
                              }
                            : {}),
                        ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                    },
                    card?._id,
                );
                // dispatch(chooseCardTable({ orderId, tableId: res.data.sub_department_id || '' }));
                messageAntd.success('Đơn đã được cập nhật!');
            } else {
                res = await createProductsOrderByAdminApi({
                    type: 'payment',
                    list_products: sortBy(
                        card?.listProducts.map((item) => ({
                            product_id: item._id,
                            name: item.name,
                            logo: item.logo,
                            quantity: item.quantity,
                            price: item.price,
                            ...(item.note ? { note: item.note } : null),
                        })),
                        (item) => item.name,
                    ),
                    total:
                        card?.listProducts.reduce(
                            (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
                            0,
                        ) || 0,
                    payment_method: `${card?.paymentMethod}`,
                    bank_code: bankCode,
                    status_order: statusAction ? 'take-away' : 'at-place',
                    group_id,
                    store_id,
                    ...(!statusAction
                        ? {
                              sub_department_id: `${
                                  serverDataDepartment
                                      ?.find((item) =>
                                          item.subDepartment.find((table) => table._id === card?.tableState),
                                      )
                                      ?.subDepartment.find((table) => table._id === card?.tableState)?._id
                              }`,
                          }
                        : {}),
                    ...(couponState?.discount_amount
                        ? {
                              discount_amount: couponState?.discount_amount,
                              discount_code: couponState?.discount_code,
                              discount_id: couponState?.discount_id,
                              discount_name: couponState?.discount_name,
                          }
                        : {}),
                    ...(phoneNumber ? { customer_phone_number: phoneNumber } : null),
                });
                setActiveKeyState(res.data.id);
                messageAntd.success('Tạo đơn thành công!');
            }
            // if (
            //     res.url &&
            //     (card?.paymentMethod === 'ATM' || card?.paymentMethod === 'CC' || card?.paymentMethod === 'EWALLET')
            // ) {
            //     setBankUrl(res.url);
            // }

            dispatch(
                setCard({
                    orderId,
                    card: {
                        ...res.data,
                        orderId: res.data.id,
                        listProducts: res.data.list_products,
                        tableState: res.data.sub_department_id,
                        statusAction: res.data.status_order === 'take-away',
                        paymentMethod: res.data.payment_method,
                        bankUrl: res.data.bank_code,
                        created: true,
                    },
                }),
            );

            socket.emit('staffOnWeb', { room: store_id });
            dispatch(getDepartment(group_id, store_id));
            dispatch(getOrders(group_id, store_id));
            setIsShowBankModal(false);
            setBankCode('');
            setLoadingPayment(false);
        } catch (err) {
            setLoadingPayment(false);
            messageAntd.error(err.message);
        }
    };

    const onTitleClick = () => {
        if (!statusAction || !card?._id) setChangeTab('1');
    };

    const submitReceivedProduct = async (quantity: number, productId: string) => {
        try {
            await changeReceivedProduct({ group_id, store_id, quantity }, productId);
            const res = await getOrderDetailApi(`${card?._id}`, group_id, store_id);
            const {
                data: { list_products, id, sub_department_id, payment_method, status_order, bank_code, _id },
            } = res;
            dispatch(
                setCard({
                    orderId,
                    card: {
                        ...res.data,
                        _id,
                        orderId: id,
                        listProducts: list_products,
                        tableState: sub_department_id,
                        statusAction: status_order === 'take-away',
                        paymentMethod: payment_method,
                        bankUrl: bank_code,
                    },
                }),
            );
            dispatch(getDepartment(group_id, store_id));
            dispatch(getOrders(group_id, store_id));
        } catch (err) {
            messageAntd.error(err.message);
        }
    };

    const onTableClick = (table: SubDepartmentDataType) => {
        if (table.active) {
            settickTable(table._id);
            setDepartmentTable({ sub_department_id: table._id, department_id: table.department_id });
        }
    };

    const resetLoadingAndModal = (v: number) => {
        settickTable('');
        setVisible(v);
        setIsShowModal(true);
    };

    const totalMoney =
        card?.listProducts.reduce((accumulator, item) => accumulator + Number(item?.price) * item.quantity, 0) || 0;

    return (
        <Spin spinning={loading}>
            <div className="aside-web-admin" ref={setContainerCart}>
                <div className="modal-order-product-box">
                    <HeaderOrderTab
                        containerCart={containerCart}
                        resetLoadingAndModal={resetLoadingAndModal}
                        onSubmitChangeOrderStatusService={onSubmitChangeOrderStatusService}
                        onTitleClick={onTitleClick}
                        statusAction={statusAction}
                        card={card}
                        serverDataDepartment={serverDataDepartment}
                    />
                    <div>
                        <div className="box-info">
                            <div className="header-info">
                                <div className="header-info-title">Các món đã chọn</div>
                            </div>
                            <div className="content-info">
                                <CustomerInput
                                    phoneNumber={phoneNumber}
                                    setCustomerId={setCustomerId}
                                    setPhoneNumber={setPhoneNumber}
                                    card={card}
                                />
                                <CartProduct
                                    listProducts={card?.listProducts}
                                    orderId={orderId}
                                    receivedSubmit={submitReceivedProduct}
                                />
                            </div>
                        </div>
                        <div className="box-info">
                            <div className="header-info">
                                <div className="header-info-title">Tổng cộng</div>
                            </div>
                            <div className="content-info">
                                <CouponInput
                                    admin
                                    listProducts={card ? [...card?.listProducts] : []}
                                    couponValue={couponState}
                                    setCouponValue={setCouponState}
                                    _id={card?._id}
                                    couponCode={card?.discount_code}
                                    customerId={customerId}
                                    activeKeyState={activeKeyState === card?.orderId}
                                />
                                <TotalPrice couponValue={couponState?.discount_amount || 0} totalMoney={totalMoney} />
                            </div>
                        </div>
                        <div style={{ paddingBottom: 64 }} className="box-info">
                            <div className="header-info">
                                <div className="header-info-title">Thanh toán</div>
                            </div>
                            <div className="content-info">
                                <CartInfoPayment
                                    paymentMethod={serverDataPaymentMethods?.filter((item) => item.active)}
                                    paymentMethodValue={card?.paymentMethod || ''}
                                    statusActionValue={statusAction}
                                    onChangeStatusAction={setStatusAction}
                                    onChangeMethodPayment={(event) => onChangeMethodPayment(event)}
                                />
                                <PriceCalculator
                                    listProducts={card?.listProducts || []}
                                    couponValue={card?.discount_amount || 0}
                                    clientMoney={clientMoney}
                                    setClientMoney={setClientMoney}
                                />
                                {card?._id && (
                                    <div className="listBox">
                                        <div className="listBox_Item" onClick={handlePrintPreview}>
                                            <div>In hoá đơn</div>
                                            <PrinterOutlined className="listBox_ItemIcon" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="button-cart-cms">
                            <FooterButtonSubmit
                                loadingPayment={loadingPayment}
                                card={card}
                                onSubmitChangeOrderStatusService={onSubmitChangeOrderStatusService}
                                loadingSave={loadingSave}
                                onSubmitSave={onSubmitSave}
                                onSubmit={onSubmit}
                                totalMoney={totalMoney}
                                discount_amount={couponState?.discount_amount || 0}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'none' }}>
                        <PrintOrder ref={componentRef} info={card} group_ws={group_ws} admin_name={admin_name} />
                        <PrintOrder ref={componentRefPreview} info={card} admin_name={admin_name} />
                    </div>
                </div>

                <CustomModal isShowModal={isShowModal} hideModal={handleModal}>
                    {visible === 1 ? (
                        <>
                            <Table
                                isShowModal
                                tickTable={tickTable}
                                onTableClick={onTableClick}
                                tablesData={serverDataDepartment}
                            />
                            <Button
                                loading={loadingSave}
                                style={{ marginTop: 10 }}
                                type="primary"
                                block
                                onClick={onSubmitChangetables}
                            >
                                Lưu thay dổi
                            </Button>
                        </>
                    ) : (
                        <div>
                            <p>Mẫu huỷ đơn</p>
                            <Space>
                                {listErrCancelOrder.map((item) => {
                                    return (
                                        <Button
                                            onClick={() => {
                                                setCancelOrder(item);
                                            }}
                                        >
                                            {item}
                                        </Button>
                                    );
                                })}
                            </Space>
                            <Input
                                allowClear
                                style={{ marginBottom: 10, marginTop: 10 }}
                                placeholder="Lý do hủy đơn"
                                required
                                value={cancelOrder}
                                onChange={(e) => {
                                    setCancelOrder(e.target.value);
                                }}
                            />
                            <Button
                                loading={loadingSave}
                                style={{ marginTop: 10 }}
                                type="primary"
                                block
                                danger
                                onClick={() => {
                                    onSubmitChangeOrderStatusService('cancel_order');
                                }}
                            >
                                Hủy đơn
                            </Button>
                        </div>
                    )}
                </CustomModal>
                <BankModal
                    loading={loadingPayment}
                    paymentMethod={`${card?.paymentMethod}`}
                    bankCode={bankCode}
                    setBankCode={setBankCode}
                    isShowBankModal={isShowBankModal}
                    setIsShowBankModal={setIsShowBankModal}
                    onSubmitBank={onSubmitBank}
                />
            </div>
        </Spin>
    );
};

export default CartCMS;
