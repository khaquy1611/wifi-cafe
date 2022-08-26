/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { FilterOutlined } from '@ant-design/icons/lib/icons';
import { dataReceipt } from 'api/types';

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

const disabledDate = (current: moment.Moment) => current > moment().endOf('day');

type IProps = {
    onFinishForm: any;
    listReceipt: any;
};

const listStatus = [
    {
        name: 'Nhập kho',
        value: 'import',
    },
    {
        name: 'Xuất kho',
        value: 'export',
    },
    {
        name: 'Đặt hàng',
        value: 'order',
    },
    {
        name: 'Đã hủy',
        value: 'cancel',
    },
];

const FormFilter = ({ onFinishForm, listReceipt }: IProps) => {
    const [form] = useForm();
    return (
        <Form form={form} onFinish={onFinishForm}>
            <Row gutter={[24, 0]}>
                <Col xs={24} sm={12} md={5} lg={5} xl={5}>
                    <Form.Item name="create_by">
                        <Input placeholder="Người tạo" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={5} lg={5} xl={5}>
                    <Form.Item name="receipt_type">
                        <Select
                            placeholder="Loại phiếu"
                            showSearch
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option: any) =>
                                ((option?.children as unknown) as string).includes(input)
                            }
                            filterSort={(optionA: any, optionB: any) =>
                                ((optionA?.children as unknown) as string)
                                    .toLowerCase()
                                    .localeCompare(((optionB?.children as unknown) as string).toLowerCase())
                            }
                        >
                            {listReceipt &&
                                listReceipt.map((item: dataReceipt) => (
                                    <Select.Option value={item.name}>{item.name}</Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={5} lg={5} xl={5}>
                    <Form.Item name="status">
                        <Select placeholder="Trạng thái" allowClear>
                            {listStatus.map((item) => (
                                <Select.Option value={item.value}>{item.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={5} lg={5} xl={5}>
                    <Form.Item name="dateFormat">
                        <RangePicker
                            style={{ width: '100%' }}
                            dropdownClassName="custom-range-picker"
                            format={dateFormat}
                            disabledDate={disabledDate}
                            ranges={{
                                'Hôm nay': [moment(), moment()],
                                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                'Tuần này': [moment().startOf('week'), moment()],
                                'Bẩy ngày qua': [moment().subtract(1, 'weeks'), moment()],
                                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                                'Một tháng qua': [moment().subtract(1, 'months'), moment()],
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={4} lg={4} xl={4}>
                    <Form.Item>
                        <Button block htmlType="submit" type="primary" icon={<FilterOutlined />}>
                            Lọc
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default FormFilter;
