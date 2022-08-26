import React from 'react';
import { Table } from 'antd';
import { ReportReqType, ReportResponseType } from 'api/types';
import { ColumnsType } from 'antd/lib/table/interface';

type IProps = {
    dataSource?: ReportResponseType[];
    columns: ColumnsType<any>;
    query?: ReportReqType;
    setQuery: (query: any) => void;
    totalPage?: number;
};

const TableReport = ({ dataSource, columns, query, setQuery, totalPage }: IProps) => {
    const onChangePagination = (page: number, pageSize: number | undefined) => {
        if (query?.limit === pageSize) {
            setQuery({ ...query, page });
        } else {
            setQuery({ ...query, page: 1, limit: pageSize });
        }
    };

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
                    pageSize: query?.limit,
                    onChange: (page, pageSize) => onChangePagination(page, pageSize),
                }}
            />
        </>
    );
};

export default TableReport;
