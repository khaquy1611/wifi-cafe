import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getClientCoupons } from 'reduxStore/clientCoupons/actions';
import { checkCouponStatus, cancelCoupon } from 'api/store';
import { CheckCouponStatusDataResponseType } from 'api/types';
import { ProductType } from 'reduxStore/bookingProducts/types';
import { Space, Input, Button, Typography, List, Popconfirm, message } from 'antd';
import { CloseOutlined, TagsOutlined } from '@ant-design/icons';
import CustomModal from 'components/admin/Modal';
import { parseCookies } from 'nookies';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

const { Text } = Typography;

interface Props {
    listProducts: ProductType[];
    couponValue?: CheckCouponStatusDataResponseType;
    setCouponValue: (value?: CheckCouponStatusDataResponseType) => void;
    _id?: string;
    admin?: boolean;
    customerId?: string;
    couponCode?: string;
    group_id_Prop?: string;
    store_id_Prop?: string;
    activeKeyState?: boolean;
}

const CouponInput = memo(
    ({
        listProducts,
        couponValue,
        setCouponValue,
        _id,
        admin,
        couponCode,
        customerId,
        group_id_Prop,
        store_id_Prop,
        activeKeyState = true,
    }: Props) => {
        const dispatch = useDispatch();

        const { group_id, store_id } = parseCookies();

        const {
            result: { data: clientCouponsData },
            loading: clientCouponsLoading,
        } = useSelector((state: ApplicationState) => state.clientCoupons);

        const totalMoney = listProducts.reduce(
            (accumulator, item) => accumulator + Number(item?.price) * item.quantity,
            0,
        );

        const [change, setChange] = useState(false); // first render
        const [loading, setLoading] = useState<boolean>(false);
        const [code, setCode] = useState<string>(couponValue?.discount_code || '');
        const [isShowModal, setIsShowModal] = useState<boolean>(false);

        const handleModal = () => {
            if (!listProducts.length) {
                message.error('Vui lòng thêm món');
                return;
            }
            setIsShowModal((prevIsShowModal) => !prevIsShowModal);
        };

        const onCheckCouponStatus = async () => {
            try {
                if (!code) {
                    message.error('Vui lòng điền mã khuyến mãi');
                    return;
                }
                if (!listProducts.length) {
                    message.error('Vui lòng thêm món');
                    return;
                }
                setLoading(true);
                const { data } = await checkCouponStatus({
                    group_id: group_id || group_id_Prop || '',
                    store_id: store_id || store_id_Prop || '',
                    code,
                    list_products: sortBy(
                        listProducts.map((item) => ({
                            product_id: item.product_id,
                            name: item.name,
                            logo: item.logo,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        (item) => item.name,
                    ),
                    total: totalMoney,
                    platform: 'web',
                    ...(admin ? { admin: true } : null),
                    ...(_id ? { order_id: '_id' } : null),
                    ...(customerId ? { customer_id: customerId } : null),
                });
                setLoading(false);
                setCouponValue(data);
                handleModal();
            } catch (err) {
                setLoading(false);
                message.error(err.message);
            }
        };

        useEffect(() => {
            if (activeKeyState && listProducts.length && couponValue?.discount_code) {
                if (change) {
                    (async function immediatelyInvokedFunction() {
                        try {
                            setLoading(true);
                            const { data } = await checkCouponStatus({
                                group_id: group_id || group_id_Prop || '',
                                store_id: store_id || store_id_Prop || '',
                                code: couponValue.discount_code,
                                list_products: sortBy(
                                    listProducts.map((item) => ({
                                        product_id: item.product_id,
                                        name: item.name,
                                        logo: item.logo,
                                        quantity: item.quantity,
                                        price: item.price,
                                    })),
                                    (item) => item.name,
                                ),
                                total: totalMoney,
                                platform: 'web',
                                ...(admin ? { admin: true } : null),
                                ...(_id ? { order_id: '_id' } : null),
                                ...(customerId ? { customer_id: customerId } : null),
                            });
                            setLoading(false);
                            setChange(false);
                            if (couponValue.discount_amount !== data.discount_amount) setCouponValue(data);
                        } catch (err) {
                            setLoading(false);
                            setChange(false);
                            message.error(err.message);
                        }
                    })();
                } else {
                    setChange(true);
                }
            }
        }, [listProducts, activeKeyState]);

        const onCouponClick = async (code: string) => {
            try {
                if (!listProducts.length) {
                    message.error('Vui lòng thêm món');
                    return;
                }
                setLoading(true);
                const { data } = await checkCouponStatus({
                    group_id: group_id || group_id_Prop || '',
                    store_id: store_id || store_id_Prop || '',
                    code,
                    list_products: sortBy(
                        listProducts.map((item) => ({
                            product_id: item.product_id,
                            name: item.name,
                            logo: item.logo,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        (item) => item.name,
                    ),
                    total: totalMoney,
                    platform: 'web',
                    ...(_id ? { order_id: '_id' } : null),
                    ...(admin ? { admin: true } : null),
                    ...(customerId ? { customer_id: customerId } : null),
                });
                setLoading(false);
                setIsShowModal(false);
                setCode(code);
                setCouponValue(data);
            } catch (err) {
                setLoading(false);
                message.error(err.message);
            }
        };

        useEffect(() => {
            if (isShowModal)
                dispatch(
                    getClientCoupons({
                        group_id: group_id || group_id_Prop || '',
                        store_id: store_id || store_id_Prop || '',
                        list_products: sortBy(
                            listProducts.map((item) => ({
                                product_id: item.product_id,
                                name: item.name,
                                logo: item.logo,
                                quantity: item.quantity,
                                price: item.price,
                            })),
                            (item) => item.name,
                        ),
                        total: totalMoney,
                        platform: 'web',
                    }),
                );
        }, [isShowModal]);

        const onCancelCoupon = async () => {
            try {
                if (_id && couponCode) {
                    await cancelCoupon({
                        order_id: _id,
                        group_id: group_id || group_id_Prop || '',
                        store_id: store_id || store_id_Prop || '',
                    });
                }
                setCouponValue(undefined);
                setCode('');
            } catch (err) {
                message.error(err.message);
            }
        };

        return (
            <div className="box-coupon">
                {!!couponValue?.discount_amount ? (
                    <>
                        <div>
                            <Space align="center" className="box-coupon-title">
                                Mã khuyến mãi: <Text mark>{couponValue.discount_code}</Text>
                                <div className="box-discount">
                                    <Text className="box-discount-title">
                                        Giảm {couponValue.discount_amount.toLocaleString('en-AU')} ₫
                                    </Text>
                                    {_id ? (
                                        <Popconfirm
                                            title="Bạn chắc chắn muốn xoá mã khuyến mãi?"
                                            okText="Có"
                                            cancelText="Không"
                                            onConfirm={onCancelCoupon}
                                        >
                                            <CloseOutlined className="box-discount-icon" style={{ fontSize: 10 }} />
                                        </Popconfirm>
                                    ) : (
                                        <CloseOutlined
                                            className="box-discount-icon"
                                            style={{ fontSize: 10 }}
                                            onClick={onCancelCoupon}
                                        />
                                    )}
                                </div>
                            </Space>
                            <div style={{ marginTop: -10, marginBottom: 10 }}>
                                <Text type="secondary">{couponValue.discount_name}</Text>
                            </div>
                        </div>
                    </>
                ) : (
                    <a className="box-coupon-title" onClick={handleModal}>
                        <TagsOutlined className="box-coupon-icon" /> Chọn mã khuyến mãi
                    </a>
                )}
                <CustomModal isShowModal={isShowModal} hideModal={handleModal} title="Mã khuyến mãi">
                    <Input.Group compact>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{ width: '70%' }}
                            placeholder="Nhập mã khuyến mãi"
                        />
                        <Button type="primary" style={{ width: '30%' }} onClick={onCheckCouponStatus} loading={loading}>
                            Áp dụng
                        </Button>
                    </Input.Group>
                    <List
                        style={{ maxHeight: '50vh', overflow: 'auto' }}
                        dataSource={clientCouponsData?.sort(
                            (a, b) => Number(b.available || 0) - Number(a.available || 0),
                        )}
                        loading={clientCouponsLoading}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => !!item.available && onCouponClick(item.code)}
                                style={{ cursor: 'pointer' }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <img
                                            alt=""
                                            style={{ width: 72, height: 'auto' }}
                                            src={
                                                item.available
                                                    ? 'https://s3.kstorage.vn/qrpayment/common/coupon.png'
                                                    : 'https://s3.kstorage.vn/qrpayment/common/coupon_uncheck.png'
                                            }
                                        />
                                    }
                                    title={
                                        <div>
                                            <div
                                                className="box-discount"
                                                style={{ display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <strong>
                                                    Giảm {item.amount.toLocaleString('en-AU')}
                                                    {item.discount_type.includes('percent') ? '% ' : ' ₫ '}
                                                </strong>
                                                <strong> Code: {item.code}</strong>
                                            </div>
                                            <Text type="secondary">{item.name}</Text>
                                        </div>
                                    }
                                    description={
                                        <span>
                                            {`HSD: ${moment.unix(item.date_expires).format('DD/MM/YYYY HH:mm')}`}
                                        </span>
                                    }
                                />
                            </List.Item>
                        )}
                        rowKey="_id"
                    />
                </CustomModal>
            </div>
        );
    },
);

export default CouponInput;
