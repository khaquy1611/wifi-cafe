import React from 'react';
import { Table } from 'antd';
import { HistoryReportReqType, HistoryResponseType } from 'api/types';
import { ColumnsType } from 'antd/lib/table/interface';

type IProps = {
    dataSource?: HistoryResponseType[];
    columns: ColumnsType<any>;
    query?: HistoryReportReqType;
    setQuery: (query: any) => void;
    totalPage?: number;
};

const TableHitory = ({ dataSource, columns, query, setQuery, totalPage }: IProps) => {
    return (
        <>
            <Table
                size="small"
                rowKey="_id"
                columns={columns}
                loading={!dataSource}
                dataSource={dataSource}
                pagination={{
                    showSizeChanger: false,
                    current: query?.page,
                    total: totalPage,
                    onChange: (page: number) => setQuery({ ...query, page }),
                }}
            />
        </>
    );
};

export default TableHitory;
