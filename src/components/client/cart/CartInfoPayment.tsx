import React from 'react';
import Image from 'next/image';
import { PaymentMethodDataType } from 'api/types';
import { Switch, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';

interface Props {
    hiddenTakeAway?: boolean;
    paymentMethodValue: string;
    paymentMethod?: PaymentMethodDataType[];
    statusActionValue: boolean;
    onChangeStatusAction?: (value: boolean) => void;
    onChangeMethodPayment?: (event: RadioChangeEvent) => void;
}

const CartInfoPayment = ({
    paymentMethodValue,
    paymentMethod,
    statusActionValue,
    onChangeStatusAction,
    onChangeMethodPayment,

    hiddenTakeAway,
}: Props) => {
    return (
        <div className="box-payemnt">
            {!hiddenTakeAway && (
                <div className="box-payemnt-item">
                    <span>Mang đi</span>
                    <span className="float-right">
                        <Switch checked={statusActionValue} onChange={onChangeStatusAction} />
                    </span>
                </div>
            )}
            <div className="box-payemnt-item">
                <div>Hình thức thanh toán</div>
                <Radio.Group value={paymentMethodValue} onChange={onChangeMethodPayment} style={{ width: '100%' }}>
                    {paymentMethod?.map((item) => (
                        <Radio key={item._id} value={item.code} className="box-payemnt-radio">
                            <div className="item-payment">
                                <div className="item-avatar">
                                    <Image
                                        width={50}
                                        height={50}
                                        objectFit="cover"
                                        quality={100}
                                        className="listProduct_CoverImg"
                                        src={`https://s3.kstorage.vn/qrpayment/common/${item.code}.png`}
                                        alt={item.name}
                                    />
                                </div>
                                <div className="item-info">
                                    <div className="item-info-title">{item.name}</div>
                                    <div className="item-info-desc">{item.desc}</div>
                                </div>
                            </div>
                        </Radio>
                    ))}
                </Radio.Group>
            </div>
        </div>
    );
};

export default CartInfoPayment;
