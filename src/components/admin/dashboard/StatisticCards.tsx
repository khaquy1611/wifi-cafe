import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { GetStatOrderDataType } from 'api/types';

interface PropsType {
    loading: boolean;
    statOrderOverviewState?: GetStatOrderDataType[];
    statOrderOverviewPaymentState?: GetStatOrderDataType[];
}

const StatisticCards = ({ loading, statOrderOverviewState, statOrderOverviewPaymentState }: PropsType) => {
    // const componentAttributes = [
    //     {
    //         backgroundColor: '#0fa44a',
    //         title: 'Đơn hàng đã hoàn thành',
    //         desc: 'Tống số đơn hàng đã được nhân viên bán hàng duyệt',
    //         value: statOrderOverviewState?.reduce((accumulator, item) => accumulator + Number(item?.count), 0),
    //         prefix: <ShoppingCartOutlined />,
    //     },
    //     {
    //         backgroundColor: '#f4123c',
    //         title: 'Doanh thu theo đơn đã hoàn thành',
    //         desc: 'Tống tiền theo đơn hàng khách đã được nhân viên bán hàng duyệt',
    //         value: statOrderOverviewState?.reduce((accumulator, item) => accumulator + Number(item?.total), 0),
    //         prefix: <DollarOutlined />,
    //     },
    // ];

    // const componentAttributesPayment = [
    //     {
    //         backgroundColor: '#f39c12',
    //         title: 'Đơn hàng đã thanh toán',
    //         desc: 'Tống số đơn hàng đã được khách thanh toán',
    //         value: statOrderOverviewPaymentState?.reduce((accumulator, item) => accumulator + Number(item?.count), 0),
    //         prefix: <ShoppingCartOutlined />,
    //     },
    //     {
    //         backgroundColor: '#068ff7',
    //         title: 'Tổng tiền đã thanh toán',
    //         desc: 'Tổng tiền đã được khách thanh toán theo đơn hàng',
    //         value: statOrderOverviewPaymentState?.reduce((accumulator, item) => accumulator + Number(item?.total), 0),
    //         prefix: <DollarOutlined />,
    //     },
    // ];

    const valuePayment = statOrderOverviewPaymentState?.reduce(
        (accumulator, item) => accumulator + Number(item.total),
        0,
    ) as number;

    const value = statOrderOverviewState?.reduce((accumulator, item) => accumulator + Number(item.total), 0) as number;

    return (
        <>
            <Row className="box-dashboard-admin" style={{ marginBottom: 24, textAlign: 'center' }}>
                <Col xs={24} sm={12}>
                    <Statistic
                        loading={loading}
                        title="Tiền khách đã thanh toán"
                        value={valuePayment}
                        suffix="₫"
                        prefix={<DollarOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Statistic
                        loading={loading}
                        title="Tiền khách đã thanh toán nhưng chưa phục vụ"
                        value={valuePayment - value}
                        suffix="₫"
                        prefix={<DollarOutlined />}
                    />
                </Col>
            </Row>
            {/* <Row gutter={[24, 24]}>
                {componentAttributesPayment.map((item) => (
                    <Col key={item.title} xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Statistic
                            loading={loading}
                            style={{ backgroundColor: item.backgroundColor }}
                            className="cms-overview-statistic"
                            title={
                                <div>
                                    <div style={{ fontSize: 16 }}>{item.title}</div>
                                    <span style={{ color: '#e2e2e2' }}>{item.desc}</span>
                                </div>
                            }
                            value={item.value}
                            prefix={item.prefix}
                        />
                    </Col>
                ))}
                {componentAttributes.map((item) => (
                    <Col key={item.title} xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Statistic
                            loading={loading}
                            style={{ backgroundColor: item.backgroundColor }}
                            className="cms-overview-statistic"
                            title={
                                <div>
                                    <div style={{ fontSize: 16 }}>{item.title}</div>
                                    <span style={{ color: '#e2e2e2' }}>{item.desc}</span>
                                </div>
                            }
                            value={item.value}
                            prefix={item.prefix}
                        />
                    </Col>
                ))}
            </Row> */}
        </>
    );
};

export default StatisticCards;
