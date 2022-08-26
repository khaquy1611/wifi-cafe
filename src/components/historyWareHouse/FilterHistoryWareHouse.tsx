import React from 'react';
import { Button, Col, DatePicker, Form, Row, Input } from 'antd';
import moment from 'moment';
import { FilterOutlined } from '@ant-design/icons/lib/icons';
import { HistoryReportReqType } from 'api/types';
import { FormInstance } from 'antd/lib/form';

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';

type IProps = {
    onFinishForm: (values: HistoryReportReqType) => void;
    form: FormInstance;
};

const disabledDate = (current: moment.Moment) => current > moment().endOf('day');

const FormFilterHistoryWareHouse = ({ form, onFinishForm }: IProps) => {
    return (
        <Form form={form} onFinish={onFinishForm}>
            <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={6}>
                    <Form.Item name="name">
                        <Input placeholder="Nguyên Liệu" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={10}>
                    <Form.Item name="dateFormat">
                        <RangePicker
                            style={{ width: '100%' }}
                            dropdownClassName="custom-range-picker"
                            format={dateFormat}
                            disabledDate={disabledDate}
                            ranges={{
                                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                'Hôm nay': [moment(), moment()],
                                'Tuần này': [moment().startOf('week'), moment()],
                                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                            }}
                            allowClear
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8}>
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

export default FormFilterHistoryWareHouse;
