import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getCustomer, getCustomerSuccess } from 'reduxStore/customer/actions';
import { CardType } from 'reduxStore/cardTabs/types';
import { Button, Select, Avatar, Space } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import CustomerModal from 'components/admin/CustomerModal';
import { parseCookies } from 'nookies';

const { Option } = Select;

interface PropsType {
    phoneNumber?: string;
    setPhoneNumber: (value?: string) => void;
    setCustomerId: (value?: string) => void;
    card?: CardType;
}

const CustomerInput = ({ phoneNumber, setPhoneNumber, setCustomerId, card }: PropsType) => {
    const dispatch = useDispatch();

    const { group_id, store_id } = parseCookies();

    const [customer, setCustomer] = useState<{ avatar: string; name: string; customer_id: string }>({
        avatar: card?.customer_avatar || '',
        name: card?.customer_name || '',
        customer_id: card?.customer_id || '',
    });

    const {
        result: { data },
    } = useSelector((state: ApplicationState) => state.customer);

    const [isShowModal, setIsShowModal] = useState(false);

    const handleModal = () => {
        setIsShowModal((prevShowModal) => !prevShowModal);
    };

    const onSearch = (searchText: string) => {
        setPhoneNumber(searchText);
        dispatch(
            getCustomer({
                group_id,
                store_id,
                phone_number: searchText,
            }),
        );
    };

    const onFocus = () => {
        dispatch(
            getCustomer({
                group_id,
                store_id,
                phone_number: phoneNumber,
            }),
        );
    };

    const onClear = () => {
        setPhoneNumber(undefined);
        setCustomerId(undefined);
    };

    const onCreateCustomer = (phoneNumber: string, avatar: string, name: string, customer_id: string) => {
        setPhoneNumber(phoneNumber);
        setCustomerId(customer_id);
        setCustomer({ avatar, name, customer_id });
    };

    const onChangeSelect = (phoneNumber: string) => {
        const customer = data?.find((item) => item.phone_number === phoneNumber);
        if (customer) {
            setCustomerId(customer._id);
            setPhoneNumber(phoneNumber);
        }
    };

    useEffect(() => {
        dispatch(
            getCustomer({
                group_id,
                store_id,
            }),
        );
        return () => {
            dispatch(getCustomerSuccess({}));
        };
    }, []);

    return (
        <div className="cart-form-info">
            <Select
                showSearch
                value={phoneNumber}
                placeholder="Tên khách hàng hoặc số điện thoại"
                style={{ width: '70%' }}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={onSearch}
                onChange={onChangeSelect}
                notFoundContent={null}
                onFocus={onFocus}
                optionLabelProp="label"
            >
                {data?.map((item) => (
                    <Option key={item._id} value={item.phone_number} label={`${item.name}: ${item.phone_number}`}>
                        <div
                            style={{ display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                                setCustomer({
                                    avatar: item.avatar,
                                    name: item.name,
                                    customer_id: item._id,
                                });
                            }}
                        >
                            <Avatar src={item.avatar} style={{ marginRight: 10 }} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                <div>
                                    SĐT:{' '}
                                    {item.phone_number &&
                                        item.phone_number.split(phoneNumber || '').map((item, index) => {
                                            if (!index) {
                                                return item;
                                            }
                                            return (
                                                <span>
                                                    <strong style={{ color: '#0fa44a' }}>{phoneNumber}</strong>
                                                    {item}
                                                </span>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </Option>
                ))}
            </Select>
            <Button type="primary" style={{ width: '30%' }} onClick={handleModal}>
                Thêm
            </Button>
            <CustomerModal
                isShowModal={isShowModal}
                handleModal={handleModal}
                updateCustomer={null}
                setIsShowModal={setIsShowModal}
                currentPagination={1}
                setPhoneNumber={onCreateCustomer}
            />
            {!!phoneNumber && (
                <Space align="center" className="label-customer">
                    <Avatar src={customer.avatar} />
                    <span style={{ fontWeight: 'bold' }}>{customer.name}</span>
                    <CloseCircleFilled style={{ color: '#dd4b39' }} onClick={onClear} className="close-customer" />
                </Space>
            )}
        </div>
    );
};

export default CustomerInput;
