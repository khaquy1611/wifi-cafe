import React from 'react';
import { Button, Col, Form, Input, Modal, notification, Row, Tabs } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { createInventoryApi } from 'api/inventory';
import { parseCookies } from 'nookies';
import { getIngredient } from 'api/store';
import { IngredientType } from 'api/types';

type IProps = {
    isModalVisible: boolean;
    setIsModalVisible: (isModalVisible: boolean) => void;
    setLinkWareHouse: (data: IngredientType[]) => void;
    linkWareHouse: any;
};

const ModalAddIngre = ({ isModalVisible, setIsModalVisible, setLinkWareHouse, linkWareHouse }: IProps) => {
    const [form] = useForm();
    const { group_id, store_id } = parseCookies();

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values: any) => {
        const body = {
            ...values,
            type: 'ingredient',
            group_id,
            store_id,
        };
        try {
            const res = await createInventoryApi(body);
            if (res)
                notification.success({
                    message: 'Tạo nguyên liệu thành công',
                });
            const resDataAdd: any = await getIngredient({ group_id, store_id, name: values.name });
            setLinkWareHouse([...linkWareHouse, { ...resDataAdd?.data[0], id: resDataAdd?.data[0]?._id }]);
            form.resetFields();
            setIsModalVisible(false);
        } catch (err) {
            notification.error({
                message: (err as Error).message,
            });
        }
    };

    return (
        <Modal
            title="Thêm nguyên liệu"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            className="modal-add-ingre"
        >
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Thông tin chung" key="1">
                    <Form layout="vertical" form={form} onFinish={onFinish}>
                        <Row gutter={[6, 6]}>
                            <Col span={12}>
                                <Form.Item
                                    label="Tên nguyên liệu"
                                    name="name"
                                    required
                                    rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Đơn vị"
                                    name="unit"
                                    required
                                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[6, 6]}>
                            <Col span={12}>
                                <Form.Item label="Số lượng ban đầu" name="amount">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Số lượng tối thiểu" name="min_amount">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="footer-btn">
                            <Button onClick={handleModalCancel} style={{ marginRight: '5px' }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Lưu
                            </Button>
                        </div>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default ModalAddIngre;
