/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table } from 'antd';
import { dataWareHouse, filterWareHouse } from 'api/types';
import { ColumnsType } from 'antd/lib/table/interface';

type IProps = {
    dataSource?: dataWareHouse[];
    columns: ColumnsType<any>;
    query?: filterWareHouse;
    setQuery: (query: any) => void;
    totalPage?: number;
};

const TableWarehouse = ({ dataSource, columns, query, setQuery, totalPage }: IProps) => {
    return (
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
                onChange: (page) => {
                    setQuery({ ...query, page });
                },
            }}
        />
    );
};

export default TableWarehouse;
