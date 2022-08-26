import React from 'react';
import { GetStatOrderDataType } from 'api/types';
import Column from './chart/Column';

interface PropsType {
    loading: boolean;
    statOrderOverviewState?: GetStatOrderDataType[];
}

const ColumnChartOrderOverview = ({ loading, statOrderOverviewState }: PropsType) => {
    return (
        <Column loading={loading} data={statOrderOverviewState} title="Doanh thu theo đơn đã hoàn thành" type="day" />
    );
};

export default ColumnChartOrderOverview;
