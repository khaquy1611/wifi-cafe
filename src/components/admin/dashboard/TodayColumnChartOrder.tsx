import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { getStatOrderToday } from 'api/statistics';
import { GetStatOrderDataType } from 'api/types';
import { parseCookies } from 'nookies';
import Column from './chart/Column';

const TodayColumnChartOrder = () => {
    const { group_id, store_id } = parseCookies();

    const [loading, setLoading] = useState<boolean>(false);

    const [statOrderTodayState, setstatOrderTodayState] = useState<GetStatOrderDataType[] | undefined>([]);

    useEffect(() => {
        setLoading(true);
        getStatOrderToday({
            group_id,
            store_id,
            status: 'completed',
        })
            .then(({ data }) => {
                setstatOrderTodayState(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error(err.message);
            });
    }, []);

    return <Column loading={loading} data={statOrderTodayState} title="Doanh thu theo đơn đã hoàn thành hôm nay" />;
};

export default TodayColumnChartOrder;
