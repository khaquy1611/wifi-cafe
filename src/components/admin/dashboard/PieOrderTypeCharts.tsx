import React, { useEffect, useState } from 'react';
import { getStatOrderType } from 'api/statistics';
import { Row, message } from 'antd';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import { GetStatOrderDataType } from 'api/types';
import { parseCookies } from 'nookies';
import _ from 'lodash';
import Donut from './chart/Donut';

interface PropsType {
    dates: RangeValue<moment.Moment>;
}

const PieOrderTypeCharts = ({ dates }: PropsType) => {
    const { group_id, store_id } = parseCookies();
    const [loading, setLoading] = useState<boolean>(false);
    const [statOrderTypePaymentState, setStatOrderTypePaymentState] = useState<GetStatOrderDataType[] | undefined>([]);
    const [statOrderTypeStatusState, setStatOrderTypeStatusState] = useState<GetStatOrderDataType[] | undefined>([]);

    useEffect(() => {
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
        Promise.all([
            getStatOrderType({
                group_id,
                store_id,
                type: 'payment',
                start,
                end,
            }),
            getStatOrderType({
                group_id,
                store_id,
                type: 'status_order',
                start,
                end,
            }),
        ])
            .then((values) => {
                const [{ data: dataStatOrderTypePayment }, { data: dataStatOrderTypeStatus }] = values;
                setStatOrderTypePaymentState(
                    _.chain(dataStatOrderTypePayment)
                        .groupBy('id')
                        .map((value, id) => ({
                            name: value[0].name,
                            id,
                            total: value?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
                            total_voucher: value?.reduce(
                                (accumulator, item) => accumulator + Number(item.total_voucher),
                                0,
                            ),
                            count: value?.reduce((accumulator, item) => accumulator + Number(item.count), 0),
                        }))
                        .value(),
                );
                setStatOrderTypeStatusState(
                    _.chain(dataStatOrderTypeStatus)
                        .groupBy('id')
                        .map((value, id) => ({
                            name: value[0].name,
                            id,
                            total: value?.reduce((accumulator, item) => accumulator + Number(item.total), 0),
                            total_voucher: value?.reduce(
                                (accumulator, item) => accumulator + Number(item.total_voucher),
                                0,
                            ),
                            count: value?.reduce((accumulator, item) => accumulator + Number(item.count), 0),
                        }))
                        .value(),
                );
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error(err.message);
            });
    }, [dates]);
    return (
        <Row gutter={[24, 24]}>
            <Donut loading={loading} data={statOrderTypePaymentState} title="Phương thức thanh toán" />
            <Donut loading={loading} data={statOrderTypeStatusState} title=" Hình thức phục vụ" />
        </Row>
    );
};

export default PieOrderTypeCharts;
