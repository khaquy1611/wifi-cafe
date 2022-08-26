/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Checkbox, Input, Modal, Table, Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAllIngredients } from 'reduxStore/ingredient/actions';
import { ApplicationState } from 'reduxStore/store';
import { parseCookies } from 'nookies';
import { IngredientType } from 'api/types';
import { SearchOutlined } from '@ant-design/icons';

type IProps = {
    isModalSearch: boolean;
    setIsModalSearch: (isModalSearch: boolean) => void;
    valueIngredient: string;
    setValueIngredient: (valueIngredient: string) => void;
    setLinkWareHouse: (data: IngredientType[]) => void;
    linkWareHouse: any;
    haveMultipleTabs?: boolean;
};

const ModalSearchIngredient = ({
    isModalSearch,
    setIsModalSearch,
    valueIngredient,
    setValueIngredient,
    setLinkWareHouse,
    linkWareHouse,
    haveMultipleTabs,
}: IProps) => {
    const [valueSearch, setValueSearch] = useState<string>(valueIngredient);
    const {
        result: { data, total },
    } = useSelector((state: ApplicationState) => state.ingredient);
    const dispatch = useDispatch();
    const { group_id, store_id } = parseCookies();
    const [query, setQuery] = useState({ page: 1 });
    const [listLinkCheck, setListLinkCheck] = useState<any>([]);
    const [curTab, setCurTab] = useState<any>('ingredient');

    const onChangeTab = (key: string) => {
        setCurTab(key);
        setQuery({ ...query, page: 1 });
    };

    useEffect(() => {
        setListLinkCheck(linkWareHouse || []);
    }, [linkWareHouse]);

    const handleOk = () => {
        setLinkWareHouse(listLinkCheck);
        setIsModalSearch(false);
        setValueIngredient('');
    };

    const handleCancel = () => {
        setIsModalSearch(false);
        setValueIngredient('');
    };

    const onChange = (e: any, record: any) => {
        if (e.target.checked) {
            setListLinkCheck([...listLinkCheck, { ...record, id: record?._id, warehouse_id: record?._id }]);
        } else {
            setListLinkCheck(listLinkCheck.filter((item: any) => item?.name !== record?.name));
        }
    };

    useEffect(() => {
        const body = {
            group_id,
            store_id,
            name: valueSearch || undefined,
            ...query,
            type: curTab,
        };
        dispatch(getAllIngredients(body));
    }, [valueSearch, group_id, store_id, query, curTab]);

    const columns = [
        {
            title: '',
            render: (_: any, record: any) => {
                return (
                    <Checkbox
                        onChange={(e: any) => onChange(e, record)}
                        defaultChecked={
                            listLinkCheck &&
                            listLinkCheck.some((item: any) =>
                                item?.id ? item?.id === record?._id : item?.warehouse_id === record?._id,
                            )
                        }
                    />
                );
            },
        },
        {
            dataIndex: 'name',
            title: 'Tên',
            key: 'name',
        },
        {
            dataIndex: 'unit',
            title: 'Đơn vị',
            key: 'unit',
        },
    ];

    return (
        <Modal
            centered
            title="Danh sách nguyên liệu"
            visible={isModalSearch}
            onOk={handleOk}
            onCancel={handleCancel}
            className="modal-search-ingredient"
        >
            {haveMultipleTabs && (
                <Tabs defaultActiveKey="ingredient" onChange={onChangeTab}>
                    <Tabs.TabPane tab="Nguyên liệu" key="ingredient" />
                    <Tabs.TabPane tab="Mặt hàng" key="item" />
                </Tabs>
            )}
            <Input
                placeholder="Tìm nguyên liệu"
                style={{ width: '100%' }}
                onChange={(e) => setValueSearch(e.target.value)}
                value={valueSearch}
                autoFocus
                allowClear
                prefix={<SearchOutlined />}
            />
            <Table
                size="small"
                dataSource={data}
                columns={columns}
                rowKey="_id"
                pagination={{
                    pageSize: 20,
                    total: total || 0,
                    current: query.page,
                    onChange: (page) => {
                        setQuery({ ...query, page });
                    },
                }}
            />
        </Modal>
    );
};

export default ModalSearchIngredient;
