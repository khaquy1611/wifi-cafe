import React, { useState, useEffect } from 'react';
import { getStatOrderProduct } from 'api/statistics';
import { Table, Avatar, message, Button, Space, Typography } from 'antd';
import { GetStatOrderDataType } from 'api/types';
import { TableOutlined } from '@ant-design/icons';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import { parseCookies } from 'nookies';

const { Title } = Typography;

const columns = () => [
    {
        title: 'Hình ảnh',
        dataIndex: 'logo',
        key: 'logo',
        render: (text: string) => <Avatar shape="square" src={text} />,
    },
    {
        title: 'Tên mặt hàng',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Số lần đặt',
        dataIndex: 'count',
        key: 'count',
    },
    {
        title: 'Số lượng',
        dataIndex: 'total',
        key: 'total',
    },
];

interface PropsType {
    dates: RangeValue<moment.Moment>;
}

const TableProductsTop = ({ dates }: PropsType) => {
    const { group_id, store_id } = parseCookies();

    const [loading, setLoading] = useState<boolean>(false);
    const [statOrderProductState, setStatOrderProductState] = useState<GetStatOrderDataType[] | undefined>([]);

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
                const { data } = await getStatOrderProduct({
                    group_id,
                    store_id,
                    start,
                    end,
                });
                setStatOrderProductState(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                message.error(err.message);
            }
        })();
    }, [dates]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const format = (s: string, c: any) => {
        return s.replace(/{(\w+)}/g, (_m, p: string) => {
            return c[p];
        });
    };

    const exportToExcel = () => {
        if (statOrderProductState && statOrderProductState.length === 0) {
            message.error('No data');
            return;
        }
        const uri = 'data:application/vnd.ms-excel;base64,';
        const template =
            '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
        const table = document.getElementById('table-customer');
        if (!table) {
            return;
        }
        const ctx = {
            worksheet: 'Worksheet',
            table: table.outerHTML,
        };
        const result = uri + window.btoa(unescape(encodeURIComponent(format(template, ctx))));
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.download = 'dashboard';
        link.href = result;
        link.click();
    };

    return (
        <div className="box-dashboard-admin">
            <Space align="center" wrap>
                <Title level={5} className="margin-bottom-0">
                    <TableOutlined /> Mặt hàng bán chạy
                </Title>
                <Button size="small" onClick={exportToExcel} type="primary">
                    Xuất báo cáo
                </Button>
            </Space>
            <Table
                style={{ marginTop: 12 }}
                id="table-customer"
                loading={loading}
                size="small"
                columns={columns()}
                dataSource={statOrderProductState}
                pagination={false}
                rowKey="id"
            />
        </div>
    );
};

export default TableProductsTop;
