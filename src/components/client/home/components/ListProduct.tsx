import React from 'react';
import Image from 'next/image';
import { Tag } from 'antd';
import { CategoryDataType } from 'api/types';

interface Props {
    item: CategoryDataType;
    onHandleClick: () => void;
}

const Product = ({ item, onHandleClick }: Props) => (
    <div className="listProduct_Button" onClick={onHandleClick}>
        <div className="listProduct_Inner">
            <div className="listProduct_Cover">
                <Image
                    width={500}
                    height={500}
                    layout="responsive"
                    objectFit="cover"
                    quality={100}
                    className="listProduct_CoverImg"
                    src={item.logo}
                    alt={item.name}
                />
                <div style={{ position: 'absolute', top: 10, right: 0 }}>
                    {item.tags?.map((list: string) => {
                        return (
                            <div>
                                <Tag color="magenta">{list}</Tag>
                            </div>
                        );
                    })}
                    {item.status === 'unavailable' && <Tag color="error">Hết món</Tag>}
                </div>
            </div>
            <div className="listProduct_Info">
                <div className="listProduct_InfoTitle">
                    <div className="listProduct_InfoName">{item.name}</div>
                    <div className="listProduct_InfoDesc">{item.desc}</div>
                </div>
                <div className="listProduct_InfoPrice">{item.price.toLocaleString('en-AU')} ₫</div>
            </div>
        </div>
    </div>
);

export default Product;
