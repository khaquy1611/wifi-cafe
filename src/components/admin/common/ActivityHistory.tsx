import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getActionLog } from 'reduxStore/actionLog/actions';
import { ActionLogDataType } from 'api/types';
import { Typography, Table, Select, Space } from 'antd';
import { parseCookies } from 'nookies';
import { ColumnsType } from 'antd/lib/table/interface';
import moment from 'moment';
import { useRouter } from 'next/router';
import { options } from 'common';

const { Title } = Typography;
const { Option } = Select;

const columns: (PropsType: string) => ColumnsType<ActionLogDataType> = (PropsType) => [
    {
        title: 'Hành động',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: ActionLogDataType) => (
            <span>
                <Space align="center" size="large">
                    <Image
                        width={32}
                        height={32}
                        quality={100}
                        objectFit="cover"
                        src={`https://s3.kstorage.vn/qrpayment/common/${record.type}.png`}
                    />
                    {PropsType === 'Actions' ? (
                        <span>
                            <Link href={`/admin/profile?id=${record.user_id}`}>{record.user_name}</Link> {text}{' '}
                            <strong>{record.order_id}</strong>
                        </span>
                    ) : (
                        <span>
                            Bạn {text} <strong>{record.order_id}</strong>
                        </span>
                    )}
                </Space>
            </span>
        ),
    },
    {
        title: 'Thời gian',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text: string) => <span>{moment(text).format('DD/MM/YYYY HH:mm')}</span>,
    },
];

interface PropsType {
    PropsType: string;
}

const ActivityHistory = ({ PropsType }: PropsType) => {
    const router = useRouter();
    const {
        query: { id },
    } = router;
    const { group_id, store_id, role } = parseCookies();

    const dispatch = useDispatch();

    const {
        result: { data, total },
        loading,
    } = useSelector((state: ApplicationState) => state.actionLog);

    const [currentPagination, setCurrentPagination] = useState<number>(1);
    const [keyActionLog, setKeyActionLog] = useState<
        'order' | 'department' | 'product' | 'image' | 'transfer' | 'all' | 'ware_house'
    >('all');

    useEffect(() => {
        if ((role === 'SUPER_ADMIN' || role === 'GROUP_ADMIN') && id) {
            dispatch(
                getActionLog({
                    group_id,
                    store_id,
                    user_id: id as string,
                }),
            );
        } else {
            dispatch(
                getActionLog({
                    group_id,
                    store_id,
                }),
            );
        }
    }, [id]);

    return (
        <Space direction="vertical" size="middle">
            {PropsType === 'Actions' && (
                <Title className="margin-bottom-0" level={2}>
                    Lịch sử hoạt động
                </Title>
            )}
            <Select
                style={{ width: '100%' }}
                value={keyActionLog}
                onChange={(value) => {
                    setKeyActionLog(value);
                    setCurrentPagination(1);
                    dispatch(
                        getActionLog({
                            group_id,
                            store_id,
                            user_id: id as string,
                            ...(value !== 'all' ? { key: value } : null),
                        }),
                    );
                }}
            >
                <Option value="all">Tất cả</Option>
                {options?.map((item) => (
                    <Option key={item.value} value={item.value}>
                        {item.label}
                    </Option>
                ))}
            </Select>
            <Table
                loading={loading}
                size="small"
                columns={columns(PropsType)}
                dataSource={data}
                rowKey="_id"
                pagination={{
                    current: currentPagination,
                    total,
                    showSizeChanger: false,
                    showTotal: (total) => {
                        return `Tổng ${total}`;
                    },
                    onChange: async (page) => {
                        setCurrentPagination(page);
                        dispatch(
                            getActionLog({
                                group_id,
                                store_id,
                                user_id: id as string,
                                offset: `${(page - 1) * 10}`,
                                ...(keyActionLog !== 'all' ? { key: keyActionLog } : {}),
                            }),
                        );
                    },
                }}
            />
        </Space>
    );
};

export default ActivityHistory;
