import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GetStatOrderDataType, ImageManagerDataType, AdminUsersDataType, AdminInfoDataType } from 'api/types';
import { updateAdminUserApi, getAdminInfoApi } from 'api/admin';
import { getStatOrderOverview } from 'api/statistics';
import { ApplicationState } from 'reduxStore/store';
import {
    Button,
    Input,
    Tabs,
    Form,
    message as messageAntd,
    Space,
    Row,
    Col,
    DatePicker,
    Switch,
    Avatar,
    Skeleton,
    Typography,
} from 'antd';
import { RangeValue } from 'node_modules/rc-picker/lib/interface';
import { FileImageOutlined } from '@ant-design/icons';
import { parseCookies } from 'nookies';
import FileManager from 'components/admin/FileManager';
import ColumnChartOrderOverview from 'components/admin/dashboard/ColumnChartOrderOverview';
import ActivityHistory from 'components/admin/common/ActivityHistory';
import ChangePassword from 'components/admin/common/ChangePassword';
import { login } from 'reduxStore/login/actions';
import moment from 'moment';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const dateFormatTime = 'DD/MM/YYYY HH:mm';
const { Text, Paragraph } = Typography;

const disabledDate = (current: moment.Moment) => current > moment().subtract(1, 'days');

const Profile = () => {
    const router = useRouter();
    const {
        query: { id },
    } = router;
    const {
        result: { data: dataUser },
    } = useSelector((state: ApplicationState) => state.login);
    const { admin_id, group_id, store_id, role } = parseCookies();
    const dispatch = useDispatch();
    const [formPass] = Form.useForm();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState<boolean>(false);
    const [loadChart, setLoadChart] = useState<boolean>(false);
    const [loadProfile, setLoadProfile] = useState<boolean>(false);
    const [dates, setDates] = useState<RangeValue<moment.Moment>>([
        moment().subtract(1, 'weeks').startOf('day'),
        moment().subtract(1, 'days'),
    ]);
    const [dataStatisticOrderState, setDataStatisticOrderState] = useState<GetStatOrderDataType[] | undefined>([]);
    const [isShowModalFile, setIsShowModalFile] = useState<boolean>(false);
    const [dataUserState, setDataUserState] = useState<AdminInfoDataType | undefined>();
    const [imageSrc, setImageSrc] = useState<string | undefined>();
    const roleAdmin = role === 'ADMIN' && dataUser?.permissions?.includes('dashboard');
    const checkRole = role === 'SUPER_ADMIN' || role === 'GROUP_ADMIN' || roleAdmin;

    const [qrcode, setQrcode] = useState<boolean | undefined>(false);

    const handleChooseImage = (image: ImageManagerDataType) => {
        form.setFieldsValue({ avatar: image.location });
        setImageSrc(image.location);
        setIsShowModalFile(false);
    };

    const handleModalFile = async () => {
        setIsShowModalFile(!isShowModalFile);
    };

    useEffect(() => {
        setQrcode(dataUser?.two_factor);
    }, [dataUser]);

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
                setLoadChart(true);
                const url = 'user';
                if (checkRole && id) {
                    const { data: dataStatisticOrder } = await getStatOrderOverview(
                        {
                            group_id,
                            store_id,
                            user_id: id as string,
                            start,
                            end,
                        },
                        url,
                    );
                    setDataStatisticOrderState(dataStatisticOrder);
                }
                setLoadChart(false);
            } catch (err) {
                setLoadChart(false);
                messageAntd.error(err.message);
            }
        })();
    }, [dates, id]);

    useEffect(() => {
        (async function getInfoFunction() {
            try {
                setLoading(true);
                const adminId = id?.toString();
                if (adminId) {
                    const { data: dataUserAdmin } = await getAdminInfoApi(adminId);
                    setDataUserState(dataUserAdmin);
                    setImageSrc(dataUserAdmin?.avatar);
                    setLoading(false);
                }
            } catch (err) {
                setLoading(false);
                messageAntd.error(err.message);
            }
        })();
    }, [dataUser, id]);

    const onSubmit = async (values: AdminUsersDataType) => {
        try {
            setLoadProfile(true);
            values.group_id = group_id;
            const data = { ...values, group_id };
            await updateAdminUserApi(data, admin_id);
            setLoadProfile(false);
            messageAntd.success('Thay đổi thông tin thành công!');
            dispatch(login(admin_id));
        } catch (err) {
            setLoadProfile(false);
            messageAntd.error(err.message);
        }
    };

    return (
        <div style={{ margin: '24px 24px 0' }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <div className="box-dashboard-admin">
                        <div style={{ textAlign: 'center', marginBottom: 24, lineHeight: 5 }}>
                            {loadProfile ? (
                                <>
                                    <p>
                                        <Skeleton.Avatar active size={128} />
                                    </p>
                                    <Skeleton.Input active style={{ width: 200 }} />
                                </>
                            ) : (
                                <>
                                    <Avatar src={dataUserState?.avatar} size={128} />
                                    <h3>{dataUserState?.name}</h3>
                                </>
                            )}
                        </div>
                        {loadProfile ? (
                            <Skeleton />
                        ) : (
                            <div className="info-customer-order-cms">
                                <div>
                                    <span>Email</span>
                                    <span className="float-right">{dataUserState?.email}</span>
                                </div>
                                <div>
                                    <span>Ngày tạo</span>
                                    <span className="float-right">
                                        {moment(dataUserState?.createdAt).format(dateFormatTime)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                    <div className="box-dashboard-admin">
                        <Tabs
                            onChange={(e) => {
                                if (e !== '2') {
                                    formPass.resetFields();
                                }
                            }}
                        >
                            {checkRole && (
                                <TabPane tab="Thống kê doanh thu" key="1">
                                    <RangePicker
                                        dropdownClassName="custom-range-picker"
                                        format={dateFormat}
                                        value={dates}
                                        allowClear={false}
                                        disabledDate={disabledDate}
                                        onChange={(datesPicker) => {
                                            if (
                                                datesPicker &&
                                                datesPicker[0] &&
                                                datesPicker[1] &&
                                                datesPicker[1].diff(datesPicker[0], 'days') > 93
                                            ) {
                                                messageAntd.error('Vui lòng chọn khoảng thời gian trong vòng 3 tháng');
                                                return;
                                            }
                                            setDates(datesPicker);
                                        }}
                                        ranges={{
                                            'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                            'Tuần này': [moment().startOf('week'), moment().subtract(1, 'days')],
                                            'Bảy ngày qua': [
                                                moment().subtract(1, 'weeks'),
                                                moment().subtract(1, 'days'),
                                            ],
                                            'Tháng này': [moment().startOf('month'), moment().subtract(1, 'days')],
                                            'Một tháng qua': [
                                                moment().subtract(1, 'months'),
                                                moment().subtract(1, 'days'),
                                            ],
                                        }}
                                    />
                                    <ColumnChartOrderOverview
                                        loading={loadChart}
                                        statOrderOverviewState={dataStatisticOrderState}
                                    />
                                </TabPane>
                            )}
                            {(role === 'SUPER_ADMIN' || role === 'GROUP_ADMIN') && (
                                <TabPane tab="Lịch sử hoạt động" key="2">
                                    <ActivityHistory PropsType="Profile" />
                                </TabPane>
                            )}
                            {id === admin_id && (
                                <TabPane tab="Thay đổi thông tin" key="3">
                                    <Form
                                        form={form}
                                        name="basic"
                                        layout="vertical"
                                        initialValues={
                                            dataUser || {
                                                active: true,
                                                receive_message_order: true,
                                                login_multi_device: true,
                                            }
                                        }
                                        onFinish={onSubmit}
                                    >
                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Họ và tên" name="name" required>
                                                    <Input required />
                                                </Form.Item>
                                                <Form.Item label="Email" name="email" required>
                                                    <Input type="email" required disabled={Boolean(dataUser)} />
                                                </Form.Item>
                                                <Form.Item label="Avatar">
                                                    <Form.Item name="avatar" noStyle>
                                                        <Input type="hidden" />
                                                    </Form.Item>
                                                    <Space size="middle">
                                                        {dataUser?.avatar && <Avatar size={64} src={imageSrc} />}
                                                        <Button
                                                            size="small"
                                                            onClick={handleModalFile}
                                                            icon={<FileImageOutlined />}
                                                        >
                                                            Chọn ảnh
                                                        </Button>
                                                    </Space>
                                                </Form.Item>
                                                <Form.Item
                                                    label="Cho phép đăng nhập trên nhiều thiết bị cùng một thời điểm"
                                                    name="login_multi_device"
                                                    valuePropName="checked"
                                                >
                                                    <Switch />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    label="Nhận thông báo trên app mobile khi khách thanh toán"
                                                    name="receive_message_order"
                                                    valuePropName="checked"
                                                >
                                                    <Switch />
                                                </Form.Item>
                                                <Form.Item
                                                    tooltip="Khi đăng nhập sẽ cần mã OTP từ ứng dụng Google Authenticator"
                                                    name="two_factor"
                                                    valuePropName="checked"
                                                    label="Bật xác thực hai bước"
                                                >
                                                    <Switch onChange={() => setQrcode(!qrcode)} />
                                                </Form.Item>
                                                {qrcode && dataUser?.secret_url && (
                                                    <div style={{ marginBottom: 24 }}>
                                                        <Paragraph>
                                                            <Text type="secondary">
                                                                Scan this QR code with 2FA application
                                                            </Text>
                                                        </Paragraph>
                                                        <QRCode includeMargin size={200} value={dataUser?.secret_url} />
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                        <Button loading={loading} block type="primary" htmlType="submit">
                                            Lưu
                                        </Button>
                                    </Form>
                                    <FileManager
                                        onClick={handleChooseImage}
                                        isShowModal={isShowModalFile}
                                        hideModal={handleModalFile}
                                    />
                                </TabPane>
                            )}
                            {id === admin_id && (
                                <TabPane tab="Thay đổi mật khẩu" key="4">
                                    <ChangePassword />
                                </TabPane>
                            )}
                        </Tabs>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
