import React, { useState } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { removeBookingProduct, changeTotalOfProduct, changeProductNote } from 'reduxStore/bookingProducts/actions';
import { deleteCardProduct, changeCardProductQuantity, changeCardProductNote } from 'reduxStore/cardTabs/actions';
import { Button, InputNumber, Popconfirm, Input, message } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, ProfileOutlined } from '@ant-design/icons';
import { ProductType } from 'reduxStore/bookingProducts/types';

interface Props {
    actions: boolean;
    orderId?: string;
    item: ProductType;
    receivedSubmit?: (quantity: number, productId: string) => void;
}

const ListProduct = ({ actions, orderId, item, receivedSubmit }: Props) => {
    const dispatch = useDispatch();

    const [note, setNote] = useState(item.note);
    const [completeOrderProduct, setCompleteOrderProduct] = useState<number>(item.number_recieve || 0);

    const onDelete = () => {
        if (orderId) {
            dispatch(deleteCardProduct({ orderId, product_id: item.product_id }));
        } else {
            dispatch(removeBookingProduct({ ...item, product_id: item.product_id }));
        }
    };

    const incrementNumber = () => {
        if (orderId) {
            dispatch(changeCardProductQuantity({ orderId, products: { ...item, quantity: item.quantity + 1 } }));
        } else {
            dispatch(changeTotalOfProduct({ ...item, quantity: item.quantity + 1 }));
        }
    };

    const decrementNumber = () => {
        if (item.quantity === 1) return;
        if (orderId) {
            dispatch(changeCardProductQuantity({ orderId, products: { ...item, quantity: item.quantity - 1 } }));
        } else {
            dispatch(changeTotalOfProduct({ ...item, product_id: item.product_id, quantity: item.quantity - 1 }));
        }
    };

    const onNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (orderId) {
            dispatch(changeCardProductNote({ orderId, products: { ...item, note: e.target.value } }));
        } else {
            dispatch(
                changeProductNote({
                    ...item,
                    product_id: item.product_id,
                    note: e.target.value,
                }),
            );
        }
    };

    return (
        <div className="productCart_List">
            <div className="productCart_Row">
                <div className="productCart_Left">
                    <Image
                        width={50}
                        height={50}
                        layout="responsive"
                        objectFit="cover"
                        quality={100}
                        className="listProduct_CoverImg"
                        src={item.logo}
                        alt={item.name}
                    />
                </div>
                <div className="productCart_Right">
                    <div className="productCart_Info">
                        <div className="productCart_InfoTitle">
                            <div className="productCart_InfoName">{item.name}</div>
                            <div className="productCart_InfoPrice">{item.price.toLocaleString('en-AU')} ₫</div>
                        </div>
                        {actions && (
                            <div className="float-right">
                                {item.number_recieve ? (
                                    <Popconfirm
                                        title="Bạn đã giao món rồi, bạn có muốn xoá món này không?"
                                        okText="Có"
                                        cancelText="Không"
                                        onConfirm={onDelete}
                                    >
                                        <Button size="small" danger shape="circle" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                ) : (
                                    <Button
                                        size="small"
                                        onClick={onDelete}
                                        danger
                                        shape="circle"
                                        icon={<DeleteOutlined />}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="priceTotal">
                        {actions ? (
                            <div className="priceTotal_Inner">
                                <div className="priceTotal_Title">Số lượng</div>
                                <div className="quantityTotal">
                                    <Button
                                        size="small"
                                        onClick={() => decrementNumber()}
                                        icon={<MinusOutlined />}
                                        className="quantityTotal_Left"
                                    />
                                    <div className="quantityTotal_Center">{item.quantity}</div>
                                    <Button
                                        size="small"
                                        onClick={() => incrementNumber()}
                                        shape="circle"
                                        icon={<PlusOutlined />}
                                        className="quantityTotal_Right"
                                    />
                                </div>
                                <div className="priceTotal_Nums">
                                    {(item.quantity * Number(item.price)).toLocaleString('en-AU')} ₫
                                </div>
                            </div>
                        ) : (
                            <div className="priceTotal_Inner">
                                <div className="priceTotal_Title">Số lượng: {item.quantity}</div>
                                <div className="priceTotal_Nums">
                                    {(item.quantity * Number(item.price)).toLocaleString('en-AU')} ₫
                                </div>
                            </div>
                        )}
                    </div>
                    {actions ? (
                        <div className="viewNote">
                            <ProfileOutlined className="viewNote_Icon" />
                            <Input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                onBlur={onNoteChange}
                                placeholder="Thêm ghi chú"
                                bordered={false}
                                maxLength={100}
                            />
                        </div>
                    ) : (
                        <div className="viewNote">
                            <ProfileOutlined className="viewNote_Icon" />
                            <div className="viewNote_content">{item.note}</div>
                        </div>
                    )}
                    {item.status === 'pending' && receivedSubmit && (
                        <div style={{ marginTop: 12 }}>
                            <InputNumber
                                size="small"
                                value={completeOrderProduct}
                                onChange={(value) => setCompleteOrderProduct(Number(value))}
                                min={0}
                                max={item.quantity}
                                formatter={(value) => {
                                    return `${value}`.replace(/\D/, '');
                                }}
                            />{' '}
                            <Button
                                size="small"
                                disabled={completeOrderProduct === Number(item.number_recieve)}
                                type="primary"
                                onClick={() => {
                                    try {
                                        receivedSubmit(completeOrderProduct, item._id);
                                        message.success(`Đã giao ${completeOrderProduct} ${item.name} thành công`);
                                    } catch (err) {
                                        message.error(err.message);
                                    }
                                }}
                            >
                                Món đã giao
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListProduct;
