import React from 'react';
import { FormInstance } from 'antd/lib/form';
import { Form, Row, Col, Select, Input, Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;
type Values = {
    name: string;
    status: string;
};
type IProps = {
    onSearchFormFilterIngredient: (value: Values) => void;
    form: FormInstance;
};

const FormFilterInventory = ({ form, onSearchFormFilterIngredient }: IProps) => {
    return (
        <Form form={form} onFinish={onSearchFormFilterIngredient}>
            <Row gutter={[24, 0]}>
                <Col xs={24} sm={8}>
                    <Form.Item name="name">
                        <Input placeholder="Tìm Kiếm" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="status">
                        <Select allowClear placeholder="-- Trạng Thái Tồn Kho --">
                            <Option value="empty">Hết hàng</Option>
                            <Option value="low"> Sắp hết hàng</Option>
                            <Option value="enough"> Còn hàng</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={6} md={3}>
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

export default FormFilterInventory;
