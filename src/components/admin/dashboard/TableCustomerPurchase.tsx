import React, { useState, useEffect } from 'react';
import { getStatOrderCustomer } from 'api/statistics';
import { GetStatOrderDataType, AdminInfoDataType } from 'api/types';
import { Table, Space, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import { parseCookies, setCookie } from 'nookies';
import { ColumnsType } from 'antd/lib/table/interface';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import Link from 'next/link';

const { Title } = Typography;

const columns: (dataLogin?: AdminInfoDataType) => ColumnsType<GetStatOrderDataType> = (dataLogin) => [
    {
        title: 'Khách hàng',
        dataIndex: 'customer_name',
        key: 'customer_name',
        render: (text: string, record: GetStatOrderDataType) => (
            <Space>
                <Avatar shape="square" src={record.customer_avatar} />
                {dataLogin?.role !== 'ADMIN' || dataLogin?.permissions?.includes('sales') ? (
                    <div
                        onClick={() =>
                            setCookie(null, 'customerName', record.customer_name as string, {
                                maxAge: 24 * 60 * 60,
                                path: '/',
                            })
                        }
                    >
                        <Link href={`/admin/sales/orders?id=${record.id}`}>{text}</Link>
                    </div>
                ) : (
                    <span>{text}</span>
                )}
            </Space>
        ),
    },
    {
        title: 'Số đơn',
        dataIndex: 'count',
        key: 'count',
        render: (text: number) => text.toLocaleString('en-AU'),
    },
    {
        title: 'Tiền khuyến mãi',
        dataIndex: 'total_voucher',
        key: 'total_voucher',
        render: (text: number) => <span>{text.toLocaleString('en-AU')} đ</span>,
    },
    {
        title: 'Tiền đơn hàng',
        dataIndex: 'total',
        key: 'total',
        render: (text: number) => <strong>{text.toLocaleString('en-AU')} đ</strong>,
    },
];

interface PropsType {
    dates: RangeValue<moment.Moment>;
}

const TableCustomerPurchase = ({ dates }: PropsType) => {
    const { group_id, store_id } = parseCookies();
    const [loading, setLoading] = useState<boolean>(false);
    const [statOrderCustomerState, setStatOrderCustomerState] = useState<GetStatOrderDataType[] | undefined>([]);
    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    useEffect(() => {
        (async function immediatelyInvokedFunction() {
            try {
                const start = Number(
                    dates &&
                        dates[0]
                            ?.set({
                                hour: 6,
                                minute: 0,
                                second: 0,
                            })
                            .unix(),
                );
                const end = Number(
                    dates &&
                        dates[1]
                            ?.set({
                                hour: 6,
                                minute: 0,
                                second: 0,
                            })
                            .unix(),
                );
                setLoading(true);
                const { data } = await getStatOrderCustomer({
                    group_id,
                    store_id,
                    start,
                    end,
                });
                setStatOrderCustomerState(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        })();
    }, [dates]);

    return (
        <div className="box-dashboard-admin">
            <Space direction="vertical" size="middle">
                <Title level={5} className="margin-bottom-0">
                    <UserOutlined /> Top khách hàng đặt đơn
                </Title>
                <Table
                    loading={loading}
                    size="small"
                    columns={columns(dataLogin)}
                    dataSource={statOrderCustomerState}
                    pagination={false}
                    rowKey="id"
                />
            </Space>
        </div>
    );
};

export default TableCustomerPurchase;
