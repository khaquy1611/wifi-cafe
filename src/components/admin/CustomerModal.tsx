import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'components/admin/Modal';
import FileManager from 'components/admin/FileManager';
import { getCustomer } from 'reduxStore/customer/actions';
import { createCustomerApi, updateCustomerApi } from 'api/store';
import { ImageManagerDataType, CustomerDataResponseType } from 'api/types';
import { Form, Row, Col, Input, Select, Button, DatePicker, message, Avatar, Space } from 'antd';
import { FileImageOutlined, MailOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
import moment from 'moment';

const { Option } = Select;

interface PropsType {
    isShowModal: boolean;
    handleModal: () => void;
    updateCustomer: CustomerDataResponseType | null;
    setIsShowModal: (value: boolean) => void;
    currentPagination: number;
    setPhoneNumber?: (value: string, avatar: string, name: string, customer_id: string) => void;
}

const CustomerModal = ({
    isShowModal,
    handleModal,
    updateCustomer,
    setIsShowModal,
    currentPagination,
    setPhoneNumber,
}: PropsType) => {
    const dispatch = useDispatch();

    const { group_id, store_id } = parseCookies();

    const [form] = Form.useForm();

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    const [imageSrc, setImageSrc] = useState<string>('');

    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);

    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    const handleChooseImage = (image: ImageManagerDataType) => {
        form.setFieldsValue({ avatar: image.location });
        setImageSrc(image.location);
        setIsShowModalFile(false);
    };

    const onSubmit = async (value: CustomerDataResponseType & { birthday: moment.Moment }) => {
        try {
            const { name, phone_number, email, avatar, birthday, gender } = value;
            const data = {
                group_id,
                store_id,
                name,
                phone_number,
                gender,
                ...(email ? { email } : null),
                ...(avatar ? { avatar } : null),
                birthday: birthday ? birthday.format('YYYYMMDD') : birthday,
            };
            setLoadingSubmit(true);
            let customer_id = '';
            if (updateCustomer) {
                await updateCustomerApi(data, updateCustomer._id);
                customer_id = updateCustomer._id;
            } else {
                const { data: dataCustomer } = await createCustomerApi(data);
                customer_id = dataCustomer._id;
            }

            dispatch(getCustomer({ group_id, store_id, offset: (currentPagination - 1) * 10 }));
            setLoadingSubmit(false);
            setIsShowModal(false);

            if (typeof setPhoneNumber === 'function') setPhoneNumber(phone_number, avatar, name, customer_id);

            message.success(`${updateCustomer ? 'Sửa' : 'Tạo'} khách hàng thành công`);
        } catch (err) {
            setLoadingSubmit(false);
            message.error(err.message);
        }
    };

    useEffect(() => {
        form.resetFields();
        setImageSrc(updateCustomer?.avatar || '');
    }, [isShowModal]);

    return (
        <Modal isShowModal={isShowModal} hideModal={handleModal}>
            <Form
                form={form}
                name="create_coupon"
                layout="vertical"
                onFinish={onSubmit}
                initialValues={
                    updateCustomer
                        ? {
                              ...updateCustomer,
                              birthday:
                                  !updateCustomer.birthday || updateCustomer.birthday === '0'
                                      ? ''
                                      : moment(updateCustomer.birthday, 'YYYYMMDD'),
                          }
                        : { gender: 'MALE' }
                }
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label="Tên khách hàng" name="name" required>
                            <Input required />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="phone_number" required>
                            <Input type="tel" required />
                        </Form.Item>
                        <Form.Item name="email" label="Email">
                            <Input type="email" placeholder="Email" prefix={<MailOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="birthday" label="Ngày sinh">
                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
                        </Form.Item>
                        <Form.Item label="Giới tính" name="gender" required>
                            <Select style={{ width: '100%' }}>
                                <Option value="MALE">Nam</Option>
                                <Option value="FEMALE">Nữ</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Avatar">
                            <Form.Item name="avatar" noStyle>
                                <Input type="hidden" />
                            </Form.Item>
                            <Space wrap>
                                {imageSrc && <Avatar size={64} src={imageSrc} />}
                                <Button size="small" onClick={handleModalFile} icon={<FileImageOutlined />}>
                                    Chọn ảnh
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
                <Button block type="primary" htmlType="submit" loading={loadingSubmit}>
                    Lưu
                </Button>
                <FileManager onClick={handleChooseImage} isShowModal={isShowModalFile} hideModal={handleModalFile} />
            </Form>
        </Modal>
    );
};

export default CustomerModal;
