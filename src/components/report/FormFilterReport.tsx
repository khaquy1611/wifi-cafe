import React from 'react';
import { Button, Col, DatePicker, Form, Row, Select } from 'antd';
import moment from 'moment';
import { FilterOutlined } from '@ant-design/icons/lib/icons';
import { ReportReqType } from 'api/types';
import { FormInstance } from 'antd/lib/form';

const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const { Option } = Select;

type IProps = {
    onFinishForm: (values: ReportReqType) => void;
    form: FormInstance;
};

const disabledDate = (current: moment.Moment) => current > moment().endOf('day');

const FormFilterReport = ({ onFinishForm, form }: IProps) => {
    return (
        <Form form={form} onFinish={onFinishForm}>
            <Row gutter={24}>
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
                <Col xs={24} sm={24} md={24} lg={6}>
                    <Form.Item name="status">
                        <Select allowClear placeholder="-- Trạng Thái --">
                            <Option value="empty">Hết hàng</Option>
                            <Option value="low"> Sắp hết hàng</Option>
                            <Option value="enough"> Còn hàng</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8}>
                    <Form.Item>
                        <Button block htmlType="submit" type="primary" icon={<FilterOutlined />}>
                            Xem báo cáo
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default FormFilterReport;
