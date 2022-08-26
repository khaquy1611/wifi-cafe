import React from 'react';
import { Button, Col, Form, Input, Modal, notification, Row, Select } from 'antd';
import { ReceiptTypeType } from 'api/types';
import { createReceiptTypeApi } from 'api/store';
import { identity, pickBy } from 'lodash';
import { parseCookies } from 'nookies';
import { getReceipt } from 'reduxStore/receipt-type/actions';
import { useDispatch } from 'react-redux';

const { Option } = Select;

type Props = {
    isModalVisibleAdd: boolean;
    handleModalCancel: () => void;
    title: string;
    setIsModalVisibleAdd: (value: boolean) => void;
};
const ModalCustomReceiptType = ({ isModalVisibleAdd, handleModalCancel, title, setIsModalVisibleAdd }: Props) => {
    const [form] = Form.useForm();
    const { group_id, store_id } = parseCookies();
    const dispatch = useDispatch();

    const hanleAddReceiptType = async (value: ReceiptTypeType) => {
        const values = pickBy(value, identity);
        try {
            const data = await createReceiptTypeApi({ group_id, store_id, ...values });
            if (data.message === 'success') {
                notification.success({
                    message: 'Tạo thành công',
                });
                setIsModalVisibleAdd(false);
                form.resetFields();
            }
            dispatch(getReceipt({ group_id, store_id }));
        } catch (err) {
            notification.error({
                message: (err as Error).message,
            });
        }
    };
    return (
        <Modal
            centered
            title={title}
            visible={isModalVisibleAdd}
            onCancel={() => {
                form.resetFields();
                handleModalCancel();
            }}
            footer={null}
        >
            <Form form={form} name="basic" layout="vertical" onFinish={hanleAddReceiptType}>
                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            rules={[{ required: true, message: 'Vui lòng nhập tên loại phiếu' }]}
                            label="Loại Phiếu"
                            name="name"
                            required
                        >
                            <Input placeholder="Nhập tên loại phiếu" allowClear />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            rules={[{ required: true, message: 'Vui lòng chọn phân loại phiếu' }]}
                            label="Phân loại phiếu"
                            name="type"
                            required
                        >
                            <Select style={{ width: '100%' }} placeholder="Lựa chọn loại phiếu" allowClear>
                                <Option value="import">Nhập kho</Option>
                                <Option value="export">Xuất Kho</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Button block type="primary" htmlType="submit">
                    Lưu
                </Button>
            </Form>
        </Modal>
    );
};

export default ModalCustomReceiptType;
