/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { ProductType } from 'reduxStore/bookingProducts/types';

const mockVal = (str: string, repeat = 1) => {
    return {
        value: `${(+(str.split(',').join('') + '0'.repeat(repeat))).toLocaleString('en-AU')}`,
    };
};

interface PropsType {
    clientMoney: string;
    setClientMoney: (value: string) => void;
    listProducts: ProductType[];
    couponValue: number;
}

const PriceCalculator = ({ clientMoney, setClientMoney, listProducts, couponValue }: PropsType) => {
    const totalMoney =
        listProducts.reduce((accumulator, item) => accumulator + Number(item?.price) * item.quantity, 0) - couponValue;

    const [options, setOptions] = useState<{ value: string }[]>([]);
    const onSearch = (searchText: string) => {
        if (isNaN(Number(searchText.split(',').join('')))) return;
        setOptions(!searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)]);
    };

    return (
        <div className="listBox">
            <div className="listBox_Item">
                <span>Khách đưa</span>
                <AutoComplete
                    value={`${(+clientMoney).toLocaleString('en-AU')}`}
                    style={{ width: '70%', float: 'right' }}
                    options={options}
                    onChange={(value) => {
                        if (isNaN(Number(value.split(',').join('')))) return;
                        setClientMoney(`${Number(value.split(',').join(''))}`);
                    }}
                    onSearch={onSearch}
                >
                    <Input placeholder="Nhập tiền khách đưa" />
                </AutoComplete>
            </div>
            <div className="listBox_Item">
                <span>Tiền thừa</span>
                <span className="float-right price-total">
                    {+clientMoney - totalMoney > 0 ? (+clientMoney - totalMoney).toLocaleString('en-AU') : 0} VND
                </span>
            </div>
        </div>
    );
};

export default PriceCalculator;
