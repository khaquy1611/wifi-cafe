import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message as messageAntd } from 'antd';
import { SaveOutlined, LockOutlined } from '@ant-design/icons';
import { AdminUsersDataType, ResetPasswordType } from 'api/types';
import { changePassword } from 'api/admin';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';

interface PropsType {
    adminUser?: AdminUsersDataType | null;
    setIsShowModalPassword?: (value: boolean) => void;
}

const ChangePassword = ({ adminUser, setIsShowModalPassword }: PropsType) => {
    const router = useRouter();
    const {
        query: { id },
    } = router;
    const [formPass] = Form.useForm();
    const { admin_id } = parseCookies();

    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    useEffect(() => {
        formPass.resetFields();
    }, []);

    const onSubmitChangePassword = async (values: ResetPasswordType) => {
        try {
            if (adminUser) {
                setLoadingSubmit(true);
                await changePassword(values, adminUser?._id);
                if (setIsShowModalPassword) {
                    setIsShowModalPassword(false);
                }
            } else if (id) {
                setLoadingSubmit(true);
                await changePassword(values, admin_id);
            }
            setLoadingSubmit(false);
            messageAntd.success('Thay đổi mật khẩu thành công!');
            formPass.resetFields();
        } catch (err) {
            setLoadingSubmit(false);
            messageAntd.error(err.message);
        }
    };

    return (
        <>
            <Form
                form={formPass}
                name="basicPassword"
                layout="vertical"
                initialValues={
                    null || {
                        password: '',
                        password_confirmation: '',
                    }
                }
                onFinish={onSubmitChangePassword}
            >
                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                    name="password_confirmation"
                    label="Xác nhận mật khẩu"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Hai mật khẩu bạn đã nhập không giống nhau!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Button loading={loadingSubmit} block type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Thay đổi mật khẩu
                </Button>
            </Form>
        </>
    );
};

export default ChangePassword;
