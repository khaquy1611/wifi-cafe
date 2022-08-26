import React from 'react';
import dynamic from 'next/dynamic';
import { Col, Skeleton, Typography } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { GetStatOrderDataType } from 'api/types';

const { Title } = Typography;

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PropsType {
    loading: boolean;
    data: GetStatOrderDataType[] | undefined;
    title: string;
}

const PieOrderTypeCharts = ({ loading, data, title }: PropsType) => {
    const labels = data?.map((item) => {
        return `${item.name} (${item.count} đơn)`;
    });
    return (
        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
            <div className="box-dashboard-admin">
                <Title level={5}>
                    <CreditCardOutlined /> {title}
                </Title>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} />
                ) : (
                    <Chart
                        series={data?.map((item) => item.total - item.total_voucher)}
                        options={{
                            labels,
                            tooltip: {
                                custom({ series, seriesIndex, w }) {
                                    return `<div class='donut-chart'>${
                                        w.config.labels[seriesIndex]
                                    } - Doanh thu: ${series[seriesIndex].toLocaleString('en-AU')} ₫</div>`;
                                },
                            },
                            plotOptions: {
                                pie: {
                                    donut: {
                                        size: '75%',
                                        labels: {
                                            show: true,
                                            total: {
                                                showAlways: true,
                                                show: true,
                                                formatter: (w) => {
                                                    return `${w.globals.seriesTotals
                                                        .reduce((a: number, b: number) => a + b, 0)
                                                        .toLocaleString('en-AU')} ₫`;
                                                },
                                            },
                                            name: {
                                                formatter: () => {
                                                    return 'Doanh thu';
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            responsive: [
                                {
                                    breakpoint: 575,
                                    options: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                },
                            ],
                        }}
                        height={250}
                        type="donut"
                    />
                )}
            </div>
        </Col>
    );
};

export default PieOrderTypeCharts;
