import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import CustomError from 'pages/_error';
import { useDispatch, useSelector } from 'react-redux';
import wrapper from 'reduxStore';
import { ApplicationState } from 'reduxStore/store';
import { getCategorySuccess } from 'reduxStore/category/actions';
import { getPaymentMethods, getPaymentMethodsSuccess } from 'reduxStore/paymentMethods/actions';
import { PaymentMethodsType } from 'reduxStore/paymentMethods/types';
import { getProducts } from 'reduxStore/products/actions';
import { PropductsType } from 'reduxStore/products/types';
import { getActionLog } from 'reduxStore/actionLog/actions';
import { ActionLogType } from 'reduxStore/actionLog/types';
import { getStatOrderOverview } from 'api/statistics';
import { ErrorType, GetStatOrderDataType } from 'api/types';
import { Space, DatePicker, message as messageAntd, Row, Col, Typography } from 'antd';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import SampleBanner from 'components/admin/SampleBanner';
import StatisticCards from 'components/admin/dashboard/StatisticCards';
import TableProductsTop from 'components/admin/dashboard/TableProductsTop';
import TableCustomerPurchase from 'components/admin/dashboard/TableCustomerPurchase';
import TableAdminRevenue from 'components/admin/dashboard/TableAdminRevenue';
import TodayStatisticCards from 'components/admin/dashboard/TodayStatisticCards';
import ActivityHistory from 'components/admin/dashboard/ActivityHistory';
import { parseCookies } from 'nookies';
import { isEmpty } from 'lodash';
import moment from 'moment';

const { Title } = Typography;

const DynamicTodayColumnChartOrderNoSSR = dynamic(
    () => import('../../../components/admin/dashboard/TodayColumnChartOrder'),
    {
        ssr: false,
    },
);

const UseMemoDynamicTodayColumnChartOrderNoSSR = () => {
    return useMemo(() => <DynamicTodayColumnChartOrderNoSSR />, []);
};

const DynamicTodayStatisticCardsNoSSR = () => {
    return useMemo(() => <TodayStatisticCards />, []);
};

const DynamicColumnChartOrderOverviewWithNoSSR = dynamic(
    () => import('../../../components/admin/dashboard/ColumnChartOrderOverview'),
    {
        ssr: false,
    },
);

const DynamicPieChartsWithNoSSR = dynamic(() => import('../../../components/admin/dashboard/PieOrderTypeCharts'), {
    ssr: false,
});

interface PropsType {
    paymentMethods: PaymentMethodsType;
    products: PropductsType;
    orderActions: ActionLogType;
    error: ErrorType;
}

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

const disabledDate = (current: moment.Moment) => current > moment().subtract(1, 'days');

const Dashboard = (props: PropsType) => {
    const {
        paymentMethods: {
            result: { data: serverDataPaymentMethods },
        },
        products: {
            result: { data: serverDataProducts },
        },
        orderActions: {
            result: { data: serverOrderActions },
        },
        error: { errorCode, message } = {},
    } = props;

    if (errorCode) {
        return <CustomError message={message} />;
    }

    const ActivityHistoryNoSSR = () => {
        return useMemo(() => <ActivityHistory serverOrderActions={serverOrderActions} />, [serverOrderActions]);
    };

    const { group_id, store_id } = parseCookies();

    const dispatch = useDispatch();

    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    const [dates, setDates] = useState<RangeValue<moment.Moment>>([
        moment().subtract(1, 'weeks').startOf('day'),
        moment().subtract(1, 'days'),
    ]);

    const [loading, setLoading] = useState<boolean>(false);

    const [statOrderOverviewState, setStatOrderOverviewState] = useState<GetStatOrderDataType[] | undefined>([]);
    const [statOrderOverviewPaymentState, setStatOrderOverviewPaymentState] = useState<
        GetStatOrderDataType[] | undefined
    >([]);

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
                const { data: dataStatOrderOverview } = await getStatOrderOverview({
                    group_id,
                    store_id,
                    start,
                    end,
                });
                const { data: dataStatOrderOverviewPayment } = await getStatOrderOverview({
                    group_id,
                    store_id,
                    start,
                    end,
                    type: 'payment',
                });
                setStatOrderOverviewState(dataStatOrderOverview);
                setStatOrderOverviewPaymentState(dataStatOrderOverviewPayment);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                messageAntd.error(err.message);
            }
        })();
    }, [dates]);

    useEffect(() => {
        return () => {
            dispatch(getCategorySuccess({}));
            dispatch(getPaymentMethodsSuccess({}));
        };
    }, []);

    return (
        <>
            {dataLogin?.role !== 'ADMIN' && isEmpty(serverDataProducts) && isEmpty(serverDataPaymentMethods) && (
                <SampleBanner />
            )}
            <div style={{ margin: '48px 24px 0' }}>
                <h2 style={{ marginBottom: 24 }}>Kết quả bán hàng hôm nay</h2>
                <DynamicTodayStatisticCardsNoSSR />
                <Row gutter={[24, 24]}>
                    <Col span={24} xl={16}>
                        <UseMemoDynamicTodayColumnChartOrderNoSSR />
                    </Col>
                    {dataLogin?.role !== 'ADMIN' && (
                        <Col span={24} xl={8}>
                            <ActivityHistoryNoSSR />
                        </Col>
                    )}
                </Row>
                <Space align="center" wrap>
                    <Title level={4} className="margin-bottom-0">
                        Thống kê bán hàng
                    </Title>
                    <RangePicker
                        dropdownClassName="custom-range-picker"
                        format={dateFormat}
                        value={dates}
                        allowClear={false}
                        disabledDate={disabledDate}
                        onChange={(datesPicker) => {
                            if (
                                datesPicker &&
                                datesPicker[0] &&
                                datesPicker[1] &&
                                datesPicker[1].diff(datesPicker[0], 'days') > 93
                            ) {
                                messageAntd.error('Vui lòng chọn khoảng thời gian trong vòng 3 tháng');
                                return;
                            }
                            setDates(datesPicker);
                        }}
                        ranges={{
                            'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                            'Tuần này': [moment().startOf('week'), moment().subtract(1, 'days')],
                            'Bảy ngày qua': [moment().subtract(1, 'weeks'), moment().subtract(1, 'days')],
                            'Tháng này': [moment().startOf('month'), moment().subtract(1, 'days')],
                            'Một tháng qua': [moment().subtract(1, 'months'), moment().subtract(1, 'days')],
                        }}
                    />
                </Space>
                <div style={{ marginBottom: 24 }} />
                <StatisticCards
                    loading={loading}
                    statOrderOverviewState={statOrderOverviewState}
                    statOrderOverviewPaymentState={statOrderOverviewPaymentState}
                />
                <DynamicColumnChartOrderOverviewWithNoSSR
                    loading={loading}
                    statOrderOverviewState={statOrderOverviewState}
                />
                <div style={{ marginBottom: 24 }} />
                <DynamicPieChartsWithNoSSR dates={dates} />
                <Row gutter={[24, 24]}>
                    <Col span={24} xl={12}>
                        <TableCustomerPurchase dates={dates} />
                    </Col>
                    <Col span={24} xl={12}>
                        <TableAdminRevenue dates={dates} dataLogin={dataLogin} />
                    </Col>
                    <Col span={24}>
                        <TableProductsTop dates={dates} />
                    </Col>
                </Row>
            </div>
        </>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    const { store } = context;
    const { tokenqr, group_id, store_id, role } = parseCookies(context);

    await store.dispatch(getPaymentMethods(group_id, store_id, tokenqr));
    await store.dispatch(getProducts(group_id, store_id, tokenqr));
    if (role && role !== 'ADMIN') {
        await store.dispatch(getActionLog({ group_id, store_id, key: 'order' }, tokenqr));
    }

    const {
        error: { errorCode: errorCodePaymentMethods },
        error: errorPaymentMethods,
    } = store.getState().paymentMethods;

    const {
        error: { errorCode: errorCodeProducts },
        error: errorProducts,
    } = store.getState().products;

    if (errorCodePaymentMethods === 4030 || errorCodeProducts === 4030) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            paymentMethods: store.getState().paymentMethods,
            products: store.getState().products,
            orderActions: store.getState().actionLog,
            error: { ...errorPaymentMethods, ...errorProducts },
        },
    };
});

export default Dashboard;
