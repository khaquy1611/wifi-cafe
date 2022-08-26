import React from 'react';
import dynamic from 'next/dynamic';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Skeleton, Button, message, Row, Col, Statistic, Badge, Typography, Space } from 'antd';
import { BarChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { GetStatOrderDataType } from 'api/types';
import moment from 'moment';

const { Title } = Typography;

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PropsType {
    loading: boolean;
    data: GetStatOrderDataType[] | undefined;
    title: string;
    type?: string;
}

const ColumnChartOrder = ({ loading, data, title, type = 'today' }: PropsType) => {
    const exportToCSV = () => {
        if (!data?.length) {
            message.error('Không có dữ liệu báo cáo');
            return;
        }
        const dataExportExcel = data?.map((item) => ({
            'Thời gian':
                type === 'today'
                    ? moment(item.time).format('k:00')
                    : moment.unix(Number(item.time)).format('DD/MM/YYYY'),
            'Số đơn': item.count,
            'Tiền khuyến mãi': item.total_voucher,
            'Tổng tiền': item.total,
        }));

        const fileName = `bao-cao-doanh-thu`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';

        const ws = XLSX.utils.json_to_sheet(dataExportExcel);
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataEx = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(dataEx, fileName + fileExtension);
    };
    return (
        <div className="box-dashboard-admin">
            <Space direction="vertical" size="large">
                <Space wrap align="center">
                    <Title level={5} className="margin-bottom-0">
                        <BarChartOutlined /> {title}
                    </Title>
                    <Button onClick={exportToCSV} type="primary" icon={<DownloadOutlined />} size="small">
                        Xuất báo cáo
                    </Button>
                </Space>
                <Row gutter={24} style={{ textAlign: 'center' }}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Statistic
                            loading={loading}
                            title={
                                <div className="col-chart-result">
                                    <Badge color="#f9bc3b" />
                                    Số đơn hàng
                                </div>
                            }
                            value={data?.reduce((accumulator, item) => accumulator + Number(item.count), 0)}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Statistic
                            loading={loading}
                            title={
                                <div className="col-chart-result">
                                    <Badge color="#49e7a6" />
                                    Tiền khuyến mãi
                                </div>
                            }
                            value={data?.reduce((accumulator, item) => accumulator + Number(item.total_voucher), 0)}
                            suffix="₫"
                        />
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Statistic
                            loading={loading}
                            title={
                                <div className="col-chart-result">
                                    <Badge color="#269ffb" />
                                    Tiền đơn hàng
                                </div>
                            }
                            value={data?.reduce((accumulator, item) => accumulator + Number(item.total), 0)}
                            suffix="đ"
                        />
                    </Col>
                </Row>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : (
                    <ReactApexChart
                        options={{
                            dataLabels: {
                                enabled: false,
                            },
                            labels: data?.map((item) =>
                                type === 'today'
                                    ? moment(item.time).format('k:00')
                                    : moment.unix(Number(item.time)).format('DD/MM'),
                            ),
                            yaxis: [
                                {
                                    labels: {
                                        formatter: (value) => {
                                            return `${value.toLocaleString('en-AU')} ₫`;
                                        },
                                    },
                                },
                                {
                                    opposite: true,

                                    labels: {
                                        formatter: (value) => {
                                            return `${value.toLocaleString('en-AU')} ₫`;
                                        },
                                    },
                                },
                                {
                                    opposite: false,
                                },
                            ],
                        }}
                        series={[
                            {
                                name: 'Tiền đơn hàng',
                                type: 'column',
                                data: data?.map((item) => item.total),
                            },
                            {
                                name: 'Tiền khuyến mãi',
                                type: 'column',
                                data: data?.map((item) => item.total_voucher),
                            },
                            {
                                name: 'Số đơn hàng',
                                type: 'line',
                                data: data?.map((item) => item.count),
                            },
                        ]}
                        type="line"
                        height={410}
                    />
                )}
            </Space>
        </div>
    );
};

export default ColumnChartOrder;
