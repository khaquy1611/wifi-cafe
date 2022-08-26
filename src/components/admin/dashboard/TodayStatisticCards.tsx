import React, { useState, useEffect } from 'react';
import { Row, Col, Statistic, message, Space } from 'antd';
import { DollarOutlined, GiftOutlined } from '@ant-design/icons';
import { getStatOrderToday } from 'api/statistics';
import { GetStatOrderDataType } from 'api/types';
import { parseCookies } from 'nookies';

const StatisticCards = () => {
    const { group_id, store_id } = parseCookies();

    const [loading, setLoading] = useState<boolean>(false);

    const [statOrderTodayCompletedState, setStatOrderTodayCompletedState] = useState<
        GetStatOrderDataType[] | undefined
    >([]);

    const [statOrderTodayProcessingState, setStatOrderTodayProcessingState] = useState<
        GetStatOrderDataType[] | undefined
    >([]);

    const [statOrderTodayPendingState, setStatOrderTodayPendingState] = useState<GetStatOrderDataType[] | undefined>(
        [],
    );

    const [statOrderTodayCancelledState, setStatOrderTodayCancelledState] = useState<
        GetStatOrderDataType[] | undefined
    >([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getStatOrderToday({
                group_id,
                store_id,
                status: 'completed',
            }),
            getStatOrderToday({
                group_id,
                store_id,
                status: 'processing',
            }),
            getStatOrderToday({
                group_id,
                store_id,
                status: 'pending',
            }),
            getStatOrderToday({
                group_id,
                store_id,
                status: 'cancelled',
            }),
        ])
            .then((values) => {
                const [
                    { data: dataStatOrderTodayCompleted },
                    { data: dataStatOrderTodayProcessing },
                    { data: dataStatOrderTodayPending },
                    { data: dataStatOrderTodayCancelled },
                ] = values;
                setStatOrderTodayCompletedState(dataStatOrderTodayCompleted);
                setStatOrderTodayProcessingState(dataStatOrderTodayProcessing);
                setStatOrderTodayPendingState(dataStatOrderTodayPending);
                setStatOrderTodayCancelledState(dataStatOrderTodayCancelled);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error(err.message);
            });
    }, []);

    const componentAttributes = [
        {
            backgroundColor: '#0fa44a',
            discount: `${statOrderTodayCompletedState?.reduce(
                (accumulator, item) => accumulator + Number(item.total_voucher),
                0,
            )}`,
            title: `${statOrderTodayCompletedState?.reduce(
                (accumulator, item) => accumulator + Number(item.count),
                0,
            )} đơn hàng đã hoàn thành`,
            value: statOrderTodayCompletedState?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
            prefix: <DollarOutlined />,
        },
        {
            backgroundColor: '#068ff7',
            discount: `${statOrderTodayProcessingState?.reduce(
                (accumulator, item) => accumulator + Number(item.total_voucher),
                0,
            )}`,
            title: `${statOrderTodayProcessingState?.reduce(
                (accumulator, item) => accumulator + Number(item.count),
                0,
            )} đơn hàng đang phục vụ`,
            value: statOrderTodayProcessingState?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
            prefix: <DollarOutlined />,
        },
        {
            backgroundColor: '#f39c12',
            discount: `${statOrderTodayPendingState?.reduce(
                (accumulator, item) => accumulator + Number(item.total_voucher),
                0,
            )}`,
            title: `${statOrderTodayPendingState?.reduce(
                (accumulator, item) => accumulator + Number(item.count),
                0,
            )} đơn hàng đang chờ xử lý`,
            value: statOrderTodayPendingState?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
            prefix: <DollarOutlined />,
        },
        {
            backgroundColor: '#f4123c',
            discount: `${statOrderTodayCancelledState?.reduce(
                (accumulator, item) => accumulator + Number(item.total_voucher),
                0,
            )}`,
            title: `${statOrderTodayCancelledState?.reduce(
                (accumulator, item) => accumulator + Number(item.count),
                0,
            )} đơn hàng đã hủy`,
            value: statOrderTodayCancelledState?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
            prefix: <DollarOutlined />,
        },
    ];

    return (
        <Row gutter={[24, 24]}>
            {componentAttributes.map((item) => (
                <Col key={item.title} span={24} lg={12} xl={6}>
                    <Statistic
                        loading={loading}
                        style={{ backgroundColor: item.backgroundColor }}
                        className="cms-overview-statistic"
                        title={
                            <Space direction="vertical">
                                {item.title}
                                <div>
                                    <GiftOutlined /> {Number(item.discount).toLocaleString('en-AU')} ₫
                                </div>
                            </Space>
                        }
                        value={item.value}
                        prefix={item.prefix}
                        suffix="₫"
                    />
                </Col>
            ))}
        </Row>
    );
};

export default StatisticCards;
