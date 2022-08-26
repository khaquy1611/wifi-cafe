import React, { useState, useEffect } from 'react';
import { Space, Typography, Row, Col } from 'antd';
import { getHistoryWareHouse } from 'api/store';
import Link from 'next/link';
import { parseCookies } from 'nookies';
import { HistoryReportReqType, HistoryResponseType } from 'api/types';
import moment from 'moment';
import FormFilterHistoryWareHouse from 'components/historyWareHouse/FilterHistoryWareHouse';
import TableHitory from 'components/historyWareHouse/TableHistory';
import { useForm } from 'antd/lib/form/Form';
import { identity, pickBy } from 'lodash';

const { Title } = Typography;
const historyWarehouse = () => {
    const [dataHistory, setDataHistory] = useState<any>();
    const { group_id, store_id } = parseCookies();
    const [query, setQuery] = useState<HistoryReportReqType>({
        page: 1,
    });
    const [form] = useForm();

    const onFinishForm = (values: HistoryReportReqType) => {
        setDataHistory([]);
        const { dateFormat } = pickBy(values, identity);
        const from = dateFormat && dateFormat[0] && `${dateFormat[0].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        const to = dateFormat && dateFormat[1] && `${dateFormat[1].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
        delete values.dateFormat;
        if (values.create_by === '') delete values.create_by;
        setQuery({
            ...values,
            page: 1,
            from,
            to,
        });
    };
    const fetchReportWareHouse = async () => {
        const res = await getHistoryWareHouse({
            group_id,
            store_id,
            ...query,
        });
        setDataHistory(res);
    };
    useEffect(() => {
        fetchReportWareHouse();
    }, [query, group_id, store_id]);

    const columns = [
        {
            dateIndex: 'createdAt',
            key: 'createdAt',
            title: 'Thời gian',
            render: (record: HistoryResponseType) => <span>{moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            dataIndex: 'name',
            key: 'name',
            title: 'Nguyên Liệu / Mặt Hàng',
        },
        {
            dataIndex: 'note',
            key: 'note',
            title: 'Ghi chú',
        },
        {
            dataIndex: 'ref',
            key: 'ref',
            title: 'Tham chiếu',
            render: (text: string) => {
                return (
                    <Link href="">
                        <a>{text}</a>
                    </Link>
                );
            },
        },
        {
            dataIndex: 'change_amount',
            key: 'change_amount',
            title: 'Thay đổi',
        },
        {
            dataIndex: 'remain_amount',
            key: 'remain_amount',
            title: 'Còn Lại',
        },
    ];
    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Lịch sử kho hàng
                    </Title>
                </Space>
                <Row justify="space-between">
                    <Col xs={24} sm={24} md={12}>
                        <FormFilterHistoryWareHouse form={form} onFinishForm={onFinishForm} />
                    </Col>
                </Row>
                <TableHitory
                    query={query}
                    setQuery={setQuery}
                    columns={columns}
                    dataSource={(() => {
                        return dataHistory?.data?.map((item: any) => {
                            const ref = item.code ?? item.orderId;
                            const change_amount = item.import_amount + item.export_amount + item.sell_amount;
                            return { ...item, ref, change_amount };
                        });
                    })()}
                    totalPage={dataHistory?.total}
                />
            </Space>
        </div>
    );
};

export default historyWarehouse;
