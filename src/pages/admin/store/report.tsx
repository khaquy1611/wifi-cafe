import React, { useState, useEffect } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography, Tabs, Row, Col, message } from 'antd';
import TableReport from 'components/report/TableReport';
import FormFilterReport from 'components/report/FormFilterReport';
import { parseCookies } from 'nookies';
import { ReportReqType } from 'api/types';
import { getReportWareHouse } from 'api/store';
import moment from 'moment';
import axios from 'axios';
import { useForm } from 'antd/lib/form/Form';
import { identity, pickBy } from 'lodash';

const { Title } = Typography;
const Report = () => {
    const { group_id, store_id } = parseCookies();
    const [query, setQuery] = useState<ReportReqType>({});
    const [dataReport, setDataReport] = useState<any>();
    const [curTab, setCurTab] = useState<string>('ingredient');
    const [form] = useForm();

    const onChangeTab = (key: string) => {
        setCurTab(key);
        form.resetFields();
        delete query.status;
        delete query.from;
        delete query.to;
        setQuery({ ...query, page: 1, limit: 10 });
    };

    const fetchReportWareHouse = async () => {
        const res = await getReportWareHouse({
            group_id,
            store_id,
            type: curTab,
            ...query,
        });
        setDataReport(res);
    };

    useEffect(() => {
        fetchReportWareHouse();
    }, [query, curTab, group_id, store_id]);

    const onFinishForm = (values: ReportReqType) => {
        setDataReport([]);
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

    const exportReport = async () => {
        try {
            const dateFormat = form.getFieldValue('dateFormat');
            // const status = form.getFieldValue('status');
            // const from =
            //     dateFormat && dateFormat[0] && `${dateFormat[0].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
            // const to = dateFormat && dateFormat[1] && `${dateFormat[1].set({ hour: 6, minute: 0, second: 0 }).unix()}`;
            const res = await axios({
                method: 'GET',
                url: `${process.env.API_URL}/api/report/ware-house/export`,
                params: {
                    group_id,
                    store_id,
                    from: query.from,
                    to: query.to,
                    type: curTab,
                    status: query.status,
                },
                withCredentials: process.env.APP_DEBUG === 'production',
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const fromDate =
                (dateFormat && dateFormat[0].format('DD-MM-YYYY')) || moment().startOf('day').format('DD-MM-YYYY');
            const toDate =
                (dateFormat && dateFormat[1].format('DD-MM-YYYY')) || moment().endOf('day').format('DD-MM-YYYY');
            const fileName = `Bao-cao-kho-hang_${fromDate}_${toDate}`;
            link.setAttribute('download', `${fileName}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const columns = [
        {
            dataIndex: 'name',
            key: 'name',
            title: 'Tên nguyên liệu',
        },
        {
            dataIndex: 'unit',
            key: 'unit',
            title: 'Đơn vị',
        },
        {
            dataIndex: 'amount',
            key: 'amount',
            title: 'Số lượng đầu kì',
        },
        {
            dataIndex: 'totalSell',
            key: 'totalSell',
            title: 'Số lượng bán',
        },
        {
            dataIndex: 'totalImport',
            key: 'totalImport',
            title: 'Thêm',
        },
        {
            dataIndex: 'totalExport',
            key: 'totalExport',
            title: 'Giảm',
        },
        {
            dataIndex: 'min_amount',
            key: 'min_amount',
            title: 'Tối thiểu',
        },
        {
            dataIndex: 'remainAmount',
            key: 'remainAmount',
            title: 'Số lượng cuối kỳ',
            render: (dataNumber: number) => {
                return dataNumber?.toLocaleString('en-US');
            },
        },
        {
            dataIndex: 'status',
            key: 'status',
            title: 'Nguyên liệu sắp hết',
            render: (text: string) => {
                let status = '';
                if (text === 'low') {
                    status = 'Sắp Hết Hàng';
                } else if (text === 'empty') {
                    status = 'Hết Hàng';
                } else {
                    status = 'Còn Hàng';
                }
                return (
                    <Tag color={text === 'empty' ? 'red' : text === 'low' ? 'orange' : 'green'}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
    ];

    return (
        <div className="site-layout-background">
            <Space direction="vertical" size="middle">
                <Space align="center" size="middle" wrap>
                    <Title level={2} className="margin-bottom-0">
                        Báo Cáo Tồn Kho Tổng Hợp
                    </Title>
                </Space>
                <Row justify="space-between">
                    <Col xs={24} sm={24} md={12}>
                        <FormFilterReport form={form} onFinishForm={onFinishForm} />
                    </Col>
                    <Col xs={24} sm={24} md={6} lg={10} xl={4}>
                        <Button type="primary" icon={<DownloadOutlined />} block onClick={exportReport}>
                            Xuất báo cáo
                        </Button>
                    </Col>
                </Row>
                <Tabs defaultActiveKey="ingredient" onChange={onChangeTab}>
                    <Tabs.TabPane tab="Nguyên liệu" key="ingredient" />
                    <Tabs.TabPane tab="Hàng tồn" key="item" />
                </Tabs>
                <div>Số lượng: {dataReport?.total}</div>
                <TableReport
                    query={query}
                    setQuery={setQuery}
                    columns={columns}
                    dataSource={dataReport?.data}
                    totalPage={dataReport?.total}
                />
            </Space>
        </div>
    );
};

export default Report;
