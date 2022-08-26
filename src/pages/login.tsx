import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { loginError } from 'reduxStore/login/actions';
import { loginApi, requestChangePasswordApi, changePasswordApi } from 'api/admin';
import { LoginType, ResetPasswordType } from 'api/types';
import { Button, Form, Input, Row, Col, Tabs, message, message as messageAntd, Space, Typography } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { setCookie } from 'nookies';
import OtpField from 'react-otp-field';

const { TabPane } = Tabs;
const { Title } = Typography;

const LoginPage = () => {
    const router = useRouter();
    const {
        query: { tab, token },
    } = router;
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<boolean>(false);
    const [activeKey, setActiveKey] = useState<string>('1');
    const [valueState, setValueState] = useState({ email: '', password: '' });
    const [otp, setOTP] = useState('');
    const errorValidation = 'Mật khẩu bạn nhập không giống nhau';

    const handleChangeOTP = async (otpIn: string) => {
        setOTP(otpIn);
        const myRe = /^[0-9]{6,6}$/;
        const myArray = myRe.test(otpIn);
        if (otpIn.length === 6 && myArray) {
            onSubmit({ ...valueState, token: otpIn });
        }
    };

    const onSubmit = async (values: LoginType) => {
        try {
            setValueState(values);
            setLoading(true);
            const { data, message: mess } = await loginApi(values);
            if (mess === 'Enter OTP') {
                setActiveKey('otp');
                setLoading(false);
                return;
            }
            setCookie(null, 'admin_id', data.id, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });
            setCookie(null, 'admin_name', data.name, {
                maxAge: 7 * 24 * 60 * 60,
                path: '/',
            });
            if (process.env.APP_DEBUG === 'development') {
                setCookie(null, 'tokenqr', data.token, {
                    maxAge: 7 * 24 * 60 * 60,
                    path: '/',
                });
            }
            message.success('Đăng nhập thành công');
            router.push('/admin/overview');
        } catch (err) {
            setLoading(false);
            message.error(err.message);
            dispatch(loginError(err.message));
        }
    };

    const onSubmitEmail = async (values: ResetPasswordType) => {
        try {
            setEmail(true);
            setLoading(true);
            await requestChangePasswordApi(values);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            messageAntd.error(err.message);
        }
    };

    const onSubmitResetPasswword = async (values: ResetPasswordType) => {
        try {
            setLoading(true);
            await changePasswordApi(values, token as string);
            setLoading(false);
            message.success('Thay đổi mật khẩu thành công');
            setActiveKey('1');
        } catch (err) {
            setLoading(false);
            messageAntd.error(err.message);
        }
    };

    useEffect(() => {
        if (tab === '3') {
            setActiveKey(tab);
        }
    }, [router]);

    return (
        <div className="web-admin-result-sidebar login-page" style={{ margin: '0 24px' }}>
            <div style={{ backgroundColor: '#fff', width: '80%' }}>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <div style={{ padding: 48 }}>
                            <Image src="/logo.svg" width={192} height={36} />
                            <Tabs defaultActiveKey="1" activeKey={activeKey}>
                                <TabPane key="1">
                                    <Form layout="vertical" onFinish={onSubmit} style={{ marginTop: 12 }}>
                                        <p>Đăng nhập để vào phiên làm việc</p>
                                        <br />
                                        <Form.Item name="email" required label="Email">
                                            <Input
                                                required
                                                size="large"
                                                type="email"
                                                placeholder="Email"
                                                prefix={<MailOutlined />}
                                            />
                                        </Form.Item>
                                        <Form.Item name="password" required label="Mật khẩu">
                                            <Input
                                                required
                                                size="large"
                                                type="password"
                                                placeholder="Mật khẩu"
                                                prefix={<LockOutlined />}
                                            />
                                        </Form.Item>
                                        <Button
                                            loading={loading}
                                            icon={<LoginOutlined />}
                                            block
                                            size="large"
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            Đăng nhập
                                        </Button>
                                    </Form>
                                </TabPane>
                                <TabPane key="2">
                                    <Form layout="vertical" onFinish={onSubmitEmail} style={{ marginTop: 12 }}>
                                        <p>Quên mật khẩu</p>
                                        <br />
                                        <Form.Item name="email" required label="Email đã đăng ký tài khoản">
                                            <Input
                                                required
                                                size="large"
                                                type="email"
                                                placeholder="Email đã đăng ký"
                                                prefix={<MailOutlined />}
                                            />
                                        </Form.Item>
                                        <Form.Item name="token" label="Mã OTP">
                                            <Input
                                                placeholder="Mã OTP dùng cho đăng nhập"
                                                size="large"
                                                minLength={6}
                                                maxLength={6}
                                                prefix={<LockOutlined />}
                                            />
                                        </Form.Item>
                                        <Button
                                            loading={loading}
                                            icon={<LoginOutlined />}
                                            block
                                            size="large"
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            Xác nhận
                                        </Button>
                                    </Form>
                                    {email && (
                                        <p style={{ marginTop: '10px', marginLeft: '40px' }}>
                                            Đăng nhập vào tài khoản email để lấy link xác thực
                                        </p>
                                    )}
                                </TabPane>
                                <TabPane key="3">
                                    <Form layout="vertical" onFinish={onSubmitResetPasswword} style={{ marginTop: 12 }}>
                                        <h1>Thay đổi mật khẩu</h1>
                                        <br />
                                        <Form.Item
                                            name="password"
                                            label="Mật khẩu"
                                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                            hasFeedback
                                        >
                                            <Input.Password size="large" prefix={<LockOutlined />} />
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
                                                        return Promise.reject(new Error(errorValidation));
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password size="large" prefix={<LockOutlined />} />
                                        </Form.Item>
                                        <Button
                                            loading={loading}
                                            icon={<LoginOutlined />}
                                            block
                                            size="large"
                                            type="primary"
                                            htmlType="submit"
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </Form>
                                </TabPane>
                                <TabPane key="otp">
                                    <div className="text-center">
                                        <Space direction="vertical" size="large">
                                            <Title level={5}>Google Authenticator</Title>
                                            <OtpField
                                                classNames="otp-field"
                                                autoFocus
                                                inputProps={{ className: 'otpLogin' }}
                                                value={otp}
                                                onChange={handleChangeOTP}
                                                numInputs={6}
                                            />
                                        </Space>
                                    </div>
                                </TabPane>
                            </Tabs>
                            <br />
                            <div
                                style={{ textAlign: 'right' }}
                                onClick={() => {
                                    setActiveKey(activeKey === '1' ? '2' : '1');
                                }}
                            >
                                <a> {activeKey === '1' ? 'Quên mật khẩu' : 'Quay lại đăng nhập'}</a>
                            </div>
                            <br />
                            <div style={{ textAlign: 'left' }}>Hỗ trợ: 0983 723 021</div>
                            <div style={{ textAlign: 'left' }}>Hỗ trợ khách hàng các ngày làm việc trong tuần</div>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className="login-col">
                        <Image
                            layout="fill"
                            objectFit="cover"
                            quality={100}
                            src="https://s3.kstorage.vn/qrpayment/common/bg_coffee.jpeg"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default LoginPage;
