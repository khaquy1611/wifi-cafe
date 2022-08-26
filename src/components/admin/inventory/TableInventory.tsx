import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { IngredientReqType, IngredientResType } from 'api/types';

type IProp = {
    loading: boolean;
    columns: ColumnsType<any>;
    query: IngredientReqType;
    dataSource: IngredientResType[];
    totalPages?: number;
    setQuery: (query: any) => void;
};
const TableInventory = ({ loading, columns, dataSource, query, totalPages, setQuery }: IProp) => {
    const onChangePagination = (page: number, pageSize: number | undefined) => {
        if (query?.limit === pageSize) {
            setQuery({ ...query, page });
        } else {
            setQuery({ ...query, page: 1, limit: pageSize });
        }
    };
    return (
        <Table
            size="small"
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={{
                showSizeChanger: false,
                current: query.page,
                pageSize: query.limit,
                total: totalPages,
                onChange: (page, pageSize) => onChangePagination(page, pageSize),
            }}
        />
    );
};

export default TableInventory;
