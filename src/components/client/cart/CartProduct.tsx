import React from 'react';
import { List } from 'antd';
import { ProductType } from 'reduxStore/bookingProducts/types';
import ListProduct from './components/ListProduct';

interface Props {
    orderId?: string;
    listProducts?: ProductType[];
    loading?: boolean;
    actions?: boolean;
    receivedSubmit?: (quantity: number, productId: string) => void;
}

const CartProduct = ({ orderId, listProducts, loading = false, actions = true, receivedSubmit }: Props) => (
    <div className="productCart">
        <List
            loading={loading}
            dataSource={listProducts}
            renderItem={(item) => (
                <List.Item className="productCart_Item">
                    <ListProduct
                        orderId={orderId}
                        key={item.product_id}
                        item={item}
                        actions={actions}
                        receivedSubmit={receivedSubmit}
                    />
                </List.Item>
            )}
        />
    </div>
);

export default CartProduct;
