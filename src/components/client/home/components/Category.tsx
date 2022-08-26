import React from 'react';

interface PropsType {
    category?: {
        _id: string;
        logo: string;
        name: string;
    }[];
    filter: string;
    setFilter: (value: string) => void;
    setSearch: (value: string) => void;
}

const CategoryProduct = ({ category, filter, setFilter, setSearch }: PropsType) => (
    <div className="boxCategory">
        <div
            className={`boxCategory_Item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => {
                setFilter('all');
                setSearch('');
            }}
        >
            <div className="boxCategory_Inner">
                <img src="https://s3.kstorage.vn/qrpayment/common/allcate.png" alt="" />
                <span>Tất cả</span>
            </div>
        </div>
        {category?.map((item) => (
            <div
                key={item._id}
                className={`boxCategory_Item ${item._id === filter ? 'active' : ''}`}
                onClick={() => {
                    setFilter(item._id);
                    setSearch('');
                }}
            >
                <div className="boxCategory_Inner">
                    <img src={item.logo} alt="" />
                    <span>{item.name}</span>
                </div>
            </div>
        ))}
    </div>
);

export default CategoryProduct;
