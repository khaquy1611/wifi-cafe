import React, { useState } from 'react';
import { Affix } from 'antd';
import Headers from 'components/client/home/Header';
import Product from 'components/client/home/Product';
import { CategoryDataType } from 'api/types';

interface PropsType {
    orderId: string;
    categoryData: CategoryDataType[] | undefined;
    productsData: CategoryDataType[] | undefined;
    setShowCart: (value: boolean) => void;
}

const ProductsTab = ({ orderId, categoryData, productsData, setShowCart }: PropsType) => {
    const [containerCart, setContainerCart] = useState<HTMLDivElement | null>(null);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');

    const products = productsData
        ?.filter((item) => {
            if (filter === 'all') return item;
            return item.category_id === filter;
        })
        .filter((item) => item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    return (
        <div
            className="web-admin-header-product"
            style={{ maxHeight: 'calc(100vh - 104px)', overflow: 'auto' }}
            ref={setContainerCart}
        >
            <Affix offsetTop={0} target={() => containerCart}>
                <Headers
                    category={categoryData}
                    options={
                        productsData?.map((item) => ({
                            value: item.name || '',
                            label: item.name || '',
                        })) || []
                    }
                    search={search}
                    setSearch={(value) => setSearch(value)}
                    filter={filter}
                    setFilter={(value) => setFilter(value)}
                />
            </Affix>
            <Product
                orderId={orderId}
                layout={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
                products={products}
                setShowCart={setShowCart}
            />
        </div>
    );
};

export default ProductsTab;
