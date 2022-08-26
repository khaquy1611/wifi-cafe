import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { addBookingProduct, changeTotalOfProduct } from 'reduxStore/bookingProducts/actions';
import { addCardProduct, changeCardProductQuantity } from 'reduxStore/cardTabs/actions';
import { Modal, message, Button, List, Typography, Tag } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { CategoryDataType } from 'api/types';
import ListProduct from './components/ListProduct';

interface PropsType {
    orderId?: string;
    products?: CategoryDataType[];
    layout?: { gutter: number; xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
    setShowCart?: (value: boolean) => void;
    showDrawer?: (value: boolean) => void;
    setBuyNow?: boolean;
}

const { Paragraph } = Typography;

const Product = ({ orderId, products, layout, setShowCart, showDrawer, setBuyNow }: PropsType) => {
    const dispatch = useDispatch();
    const { result } = useSelector((state: ApplicationState) => state.bookingProducts);
    const {
        result: { cards },
    } = useSelector((state: ApplicationState) => state.cardTabs);
    const [isModalProduct, setIsModalProduct] = useState<boolean>(false);
    const [productItem, setProductItem] = useState<CategoryDataType | null>(null);
    const [numberItem, setNumberItem] = useState<number>(1);

    const showModalProduct = (item: CategoryDataType) => {
        setProductItem(item);
        setIsModalProduct(true);
    };

    const hideModalProduct = () => {
        setIsModalProduct(false);
    };

    const addProduct = (value: string) => {
        setIsModalProduct(false);
        if (productItem) {
            if (orderId) {
                const product = cards
                    .find((item) => item.orderId === orderId)
                    ?.listProducts.find((item) => item.product_id === productItem?._id);
                if (product) {
                    dispatch(
                        changeCardProductQuantity({
                            orderId,
                            products: {
                                ...productItem,
                                product_id: productItem._id,
                                quantity: product.quantity + numberItem,
                            },
                        }),
                    );
                } else {
                    dispatch(
                        addCardProduct({
                            orderId,
                            products: { ...productItem, product_id: productItem._id, quantity: numberItem },
                        }),
                    );
                }
            } else if (result.client.find((elem) => elem.product_id === productItem?._id)) {
                const productFound = result.client.find((elem) => elem.product_id === productItem?._id);
                dispatch(
                    changeTotalOfProduct({
                        ...productItem,
                        product_id: productItem._id,
                        quantity: Number(productFound?.quantity) + numberItem,
                        note: productFound?.note,
                    }),
                );
            } else {
                dispatch(addBookingProduct({ ...productItem, product_id: productItem._id, quantity: numberItem }));
            }
            if (setShowCart) setShowCart(true);
            if (setBuyNow && value === 'buy_now' && showDrawer) showDrawer(true);
            message.info(`${productItem.name} đã được thêm vào`);
        }
    };

    const incrementNumber = () => {
        setNumberItem((prevNumberItem) => prevNumberItem + 1);
    };

    const decrementNumber = () => {
        setNumberItem((prevNumberItem) => {
            if (prevNumberItem === 1) return prevNumberItem;
            return prevNumberItem - 1;
        });
    };

    useEffect(() => {
        if (!isModalProduct) {
            setProductItem(null);
            setNumberItem(1);
        }
    }, [isModalProduct]);

    return (
        <>
            <div className="page-home-list-product listProduct">
                <List
                    grid={layout}
                    dataSource={products}
                    renderItem={(item) => (
                        <List.Item>
                            <ListProduct
                                onHandleClick={() => {
                                    if (item.status) {
                                        if (item.status === 'available') {
                                            showModalProduct(item);
                                        } else {
                                            message.error('Món tạm thời hết');
                                        }
                                    } else {
                                        showModalProduct(item);
                                    }
                                }}
                                item={item}
                            />
                        </List.Item>
                    )}
                />
            </div>
            <Modal
                className="modalProduct"
                maskClosable={false}
                visible={isModalProduct}
                footer={null}
                centered
                onCancel={hideModalProduct}
                width={720}
            >
                <div className="modalProduct_Inner">
                    <div className="modalProduct_Row">
                        <div className="modalProduct_Left" style={{ position: 'relative' }}>
                            <Image
                                width={500}
                                height={500}
                                layout="responsive"
                                objectFit="cover"
                                quality={100}
                                className="modalProduct_Cover"
                                src={productItem?.logo as string}
                                alt={productItem?.name}
                            />
                            <div style={{ position: 'absolute', top: 10, right: 0 }}>
                                {productItem?.tags?.map((list: string) => {
                                    return (
                                        <div>
                                            <Tag color="magenta">{list}</Tag>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="modalProduct_Right">
                            <div className="modalProduct_Info">
                                <div className="modalProduct_Name">{productItem?.name}</div>
                                <Paragraph
                                    className="modalProduct_Desc"
                                    ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
                                >
                                    {productItem?.desc}
                                </Paragraph>
                                <div className="modalProduct_Price">{productItem?.price.toLocaleString('en-AU')} ₫</div>
                            </div>
                            <div className="modalProduct_Submit">
                                <div className="modalProduct_SubmitTotal">
                                    <span>Số lượng</span>
                                    <span className="quantityTotal">
                                        {/* {(numberItem * Number(productItem?.price)).toLocaleString('en-AU')} Đ */}
                                        <Button
                                            onClick={decrementNumber}
                                            icon={<MinusOutlined />}
                                            size="small"
                                            className="quantityTotal_Left"
                                        />
                                        <div className="quantityTotal_Center">{numberItem}</div>
                                        <Button
                                            onClick={incrementNumber}
                                            size="small"
                                            icon={<PlusOutlined />}
                                            className="quantityTotal_Right"
                                        />
                                    </span>
                                </div>
                                <div className="modalProduct_Button">
                                    {setBuyNow ? (
                                        <div className="modalProduct_ButtonInner">
                                            <Button
                                                className="modalProduct_ButtonAction"
                                                onClick={() => addProduct('add_to_cart')}
                                                style={{ marginRight: 4 }}
                                                size="large"
                                            >
                                                Thêm vào gọi món
                                            </Button>
                                            <Button
                                                className="modalProduct_ButtonAction"
                                                type="primary"
                                                size="large"
                                                onClick={() => addProduct('buy_now')}
                                                style={{ marginLeft: 4 }}
                                            >
                                                Mua ngay
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            className="modalProduct_ButtonAction"
                                            block
                                            type="primary"
                                            size="large"
                                            onClick={() => addProduct('add_to_cart')}
                                        >
                                            Thêm vào gọi món
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="modal-order-product-box">
                    <div className="modal-order-product-option">Size</div>
                    <div>
                        <Radio.Group style={{ width: '100%' }}>
                            <Row>
                                <Col span={24}>
                                    <div className="modal-order-product-radio-check">
                                        <Radio value={1}>
                                            <span>Lớn</span>
                                            <span className="float-right">+ 10.000 đ</span>
                                        </Radio>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div className="modal-order-product-radio-check">
                                        <Radio value={2}>
                                            <span>Vừa</span>
                                            <span className="float-right">+ 5.000 đ</span>
                                        </Radio>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <div className="modal-order-product-radio-check">
                                        <Radio value={3}>
                                            <span>Nhỏ</span>
                                        </Radio>
                                    </div>
                                </Col>
                            </Row>
                        </Radio.Group>
                    </div>
                </div>
                <div className="modal-order-product-box">
                    <div className="modal-order-product-option">Topping</div>
                    <Checkbox.Group style={{ width: '100%' }}>
                        <Row>
                            <Col span={24}>
                                <div className="modal-order-product-radio-check">
                                    <Checkbox value="A">
                                        <span>Dừa khô</span>
                                        <span className="float-right">+ 5.000 đ</span>
                                    </Checkbox>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="modal-order-product-radio-check">
                                    <Checkbox value="B">
                                        <span>Trân châu</span>
                                        <span className="float-right">+ 5.000 đ</span>
                                    </Checkbox>
                                </div>
                            </Col>
                        </Row>
                    </Checkbox.Group>
                </div> */}
            </Modal>
        </>
    );
};

export default Product;
