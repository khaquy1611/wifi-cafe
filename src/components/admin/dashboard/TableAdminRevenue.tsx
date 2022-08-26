import React, { useState, useEffect } from 'react';
import { getAdminRevenueOverviewApi } from 'api/statistics';
import { GetStatOrderDataType, AdminInfoDataType } from 'api/types';
import { Table, Space, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import { parseCookies } from 'nookies';
import { ColumnsType } from 'antd/lib/table/interface';

const { Title } = Typography;

const columns: (dataLogin?: AdminInfoDataType) => ColumnsType<GetStatOrderDataType> = (dataLogin) => [
    {
        title: 'Nhân viên',
        dataIndex: 'user_name',
        key: 'user_name',
        render: (text: string, record: GetStatOrderDataType) => (
            <Space>
                <Avatar shape="square" src={record.user_avatar} />
                {dataLogin?.role !== 'ADMIN' ? (
                    <a target="blank" href={`/admin/profile?id=${record.id}`}>
                        {text}
                    </a>
                ) : (
                    <span>{text}</span>
                )}
            </Space>
        ),
    },
    {
        title: 'Số  đơn',
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
    dataLogin: AdminInfoDataType | undefined;
}

const TableAdminRevenue = ({ dates, dataLogin }: PropsType) => {
    const { group_id, store_id } = parseCookies();
    const [loading, setLoading] = useState<boolean>(false);
    const [statSaleAdminState, setStatSaleAdminState] = useState<GetStatOrderDataType[] | undefined>([]);

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
                const { data } = await getAdminRevenueOverviewApi({
                    group_id,
                    store_id,
                    start,
                    end,
                });
                setStatSaleAdminState(data);
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
                    <UserOutlined /> Thống kê theo nhân viên
                </Title>
                <Table
                    loading={loading}
                    size="small"
                    columns={columns(dataLogin)}
                    dataSource={statSaleAdminState}
                    pagination={false}
                    rowKey="id"
                />
            </Space>
        </div>
    );
};

export default TableAdminRevenue;
