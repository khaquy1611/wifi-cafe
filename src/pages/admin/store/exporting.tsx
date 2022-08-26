/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Button, Typography, Tag, Popconfirm, Space, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import FormFilter from 'components/admin/store/FormFilter';
import TableWarehouse from 'components/admin/store/TableWarehouse';
import moment from 'moment';
import { cancelReceipt, getListReceipt, getListWareHouse } from 'api/store';
import { parseCookies } from 'nookies';
import { renderTagStatus } from 'common';
import {
    dataWareHouseRes,
    filterWareHouse,
    dataReceipt,
    link_warehouse,
    list_operator,
    dataWareHouse,
} from 'api/types';
import ModalReceipt from 'components/admin/inventory/ModalReceipt';

const { Title } = Typography;

const exporting = () => {
    const [query, setQuery] = useState<filterWareHouse>();
    const [dataExport, setDataExport] = useState<dataWareHouseRes>();
    const [dataReceipt, setDataReceipt] = useState<dataReceipt>();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [curIdRecord, setCurIdRecord] = useState<string>('');
    const [typeBtnVisible, setTypeBtnVisible] = useState<any>('');
    const { group_id, store_id } = parseCookies();

    const columns = [
        {
            dateIndex: 'createdAt',
            key: 'createdAt',
            title: 'Thời gian tạo',
            render: (record: dataWareHouse) => <span>{moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            dataIndex: 'code',
            key: 'code',
            title: 'Mã phiếu',
        },
        {
            dataIndex: 'receipt_type',
            key: 'receipt_type',
            title: 'Loại phiếu',
        },
        {
            dataIndex: 'name',
            key: 'name',
            title: 'Tên phiếu',
        },
        {
            dataIndex: 'link_warehouse',
            key: 'link_warehouse',
            title: 'Số lượng',
            render: (link_warehouse: link_warehouse[]) => {
                let amount = 0;
                link_warehouse.forEach((item) => {
                    amount += item.quantity;
                });
                return <>{amount}</>;
            },
        },
        {
            dataIndex: 'list_operator',
            key: 'list_operator',
            title: 'Người tạo',
            render: (list_operator: list_operator[]) => {
                const createdBy = list_operator.filter((item) => item.action === 'order' || item.action === 'export');
                return <>{createdBy[0]?.name}</>;
            },
        },
        {
            dataIndex: 'status',
            key: 'status',
            title: 'Trạng thái',
            render: (text: string) => <Tag color={renderTagStatus(text).color}>{renderTagStatus(text).label}</Tag>,
        },
        {
            title: '',
            key: 'action',
            render: (record: dataWareHouse) => {
                return (
                    <Space>
                        <Button
                            size="small"
                            onClick={() => {
                                setCurIdRecord(record._id);
                                setTypeBtnVisible('detail');
                                setIsModalVisible(true);
                            }}
                        >
                            Chi tiết
                        </Button>
                        <Popconfirm
                            title="Bạn chắc chắn muốn hủy phiếu?"
                            okText="Có"
                            cancelText="Không"
                            onConfirm={() => onCancelReceipt(record)}
                            disabled={record.status === 'cancel'}
                        >
                            <Button danger size="small" icon={<DeleteOutlined />} disabled={record.status === 'cancel'}>
                                Hủy phiếu
                            </Button>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const onCancelReceipt = async (record: dataWareHouse) => {
        try {
            await cancelReceipt(record?._id, group_id, store_id);
            const res = await getListWareHouse({ ...query, group_id, store_id, type: 'export' });
            setDataExport(res);
            message.success('Thành công');
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const onFinishForm = (values: filterWareHouse) => {
        const { dateFormat } = values;
        const from = dateFormat && dateFormat[0] && `${dateFormat[0].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        const to = dateFormat && dateFormat[1] && `${dateFormat[1].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        delete values.dateFormat;
        if (values.create_by === '') delete values.create_by;
        setQuery({
            ...values,
            from,
            to,
            group_id,
            store_id,
            type: 'export',
            page: 1,
        });
    };

    const fetchListExport = async () => {
        const res = await getListWareHouse({ ...query, group_id, store_id, type: 'export' });
        setDataExport(res);
    };

    useEffect(() => {
        fetchListExport();
    }, [query]);

    useEffect(() => {
        const fetchListExportReceipt = async () => {
            const res = await getListReceipt({ group_id, store_id, type: 'export' });
            setDataReceipt(res.data);
        };
        fetchListExportReceipt();
    }, []);

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Danh sách phiếu xuất kho
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setIsModalVisible(true);
                            setTypeBtnVisible('add_export');
                        }}
                    >
                        Thêm phiếu xuất
                    </Button>
                </Space>
                <FormFilter onFinishForm={onFinishForm} listReceipt={dataReceipt} />
                <TableWarehouse
                    query={query}
                    setQuery={setQuery}
                    columns={columns}
                    dataSource={dataExport?.data}
                    totalPage={dataExport?.total}
                />
                {isModalVisible && (
                    <ModalReceipt
                        isModalVisible={isModalVisible}
                        setIsModalVisible={setIsModalVisible}
                        dataReceipt={{ type: typeBtnVisible, id: curIdRecord }}
                        reloadList={() => fetchListExport()}
                    />
                )}
            </Space>
        </div>
    );
};

export default exporting;
