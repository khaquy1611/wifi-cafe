import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import {
    Space,
    Row,
    Col,
    Button,
    Form,
    Image,
    message as messageAntd,
    Checkbox,
    InputNumber,
    Divider,
    Statistic,
    Select,
    Radio,
    List,
    Input,
} from 'antd';
import { transferApi, accountInformationApi, getWithdrawalHistoryApi } from 'api/store';
import { TransferRequestType, WithdrawalResponeType, WithdrawalDataType, ValidateStatus } from 'api/types';
import { DollarOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import { parseCookies } from 'nookies';
import { listBank } from 'common';
import moment from 'moment';
import { getTurnover } from 'reduxStore/turnover/actions';
import { getWithdrawalHistory } from 'reduxStore/withdrawalHistory/actions';

const { Option } = Select;

export const checkValidateInput = (str: string) => {
    if (/^[a-zA-Z0-9- ]*$/.test(str) === false) {
        return false;
    }
    return true;
};
interface PropsType {
    loadingTurnover: boolean;
}

const RevenueManagement = ({ loadingTurnover }: PropsType) => {
    const [formTransfer] = Form.useForm();

    const { group_id, store_id } = parseCookies();

    const dispatch = useDispatch();

    const [dataWithdrawal, setDataWithdrawal] = useState<WithdrawalResponeType | null>(null);

    const [isShowModalTransfer, setIsShowModalTransfer] = useState<boolean>(false);
    const [bankCode, setBankCode] = useState<string>('');
    const [errMessageText, setErrMessageText] = useState<boolean>(false);
    const [onChangeInfo, setOnChangeInfo] = useState<boolean>(false);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [notificationAccountName, setNotificationAccountName] = useState<string>('');
    const [validateStatusName, setValidateStatusName] = useState<ValidateStatus>('' as ValidateStatus);
    const {
        result: { data: dataStateTurnover },
        loading: LoadingTurnover,
    } = useSelector((state: ApplicationState) => state.turnover);
    const {
        result: { data: dataStateActionLog },
        loading: LoadingActionLog,
    } = useSelector((state: ApplicationState) => state.withdrawalHistory);
    useEffect(() => {
        dispatch(getWithdrawalHistory({ group_id, store_id, key: 'transfer' }));
        dispatch(getTurnover({ group_id, store_id }));
    }, [loadingTurnover]);

    useEffect(() => {
        async function getDataWithdrawal() {
            try {
                const withdrawal = await getWithdrawalHistoryApi({ group_id, store_id });
                setDataWithdrawal(withdrawal);
            } catch (error) {
                messageAntd.error(error.message);
            }
        }
        getDataWithdrawal();
        setNotificationAccountName('');
        setValidateStatusName('' as ValidateStatus);
    }, [isShowModalTransfer]);
    const handleModalTransfer = () => {
        formTransfer.resetFields();
        setBankCode('');
        setIsShowModalTransfer(!isShowModalTransfer);
        if (!isShowModalTransfer) {
            setNotificationAccountName('');
        }
    };

    const onHandleBankCode = async (bank: WithdrawalDataType) => {
        setNotificationAccountName('');
        setValidateStatusName('' as ValidateStatus);
        formTransfer.setFieldsValue({
            bankCode: bank.bankCode,
            accountNo: bank.accountNo,
            accountType: bank.accountType,
            accountName: bank.accountName,
        });
    };

    const onSubmiTransfer = async (values: TransferRequestType) => {
        try {
            values.group_id = group_id;
            values.store_id = store_id;
            setLoadingSubmit(true);
            messageAntd.loading('Đang thực hiện chuyển tiền', 10);
            await transferApi(values);
            dispatch(getTurnover({ group_id, store_id }));
            dispatch(getWithdrawalHistory({ group_id, store_id, key: 'transfer' }));
            setLoadingSubmit(false);
            messageAntd.success('Chuyển khoản thành công');
            setIsShowModalTransfer(!isShowModalTransfer);
        } catch (err) {
            setLoadingSubmit(false);
            messageAntd.error(err.message);
        }
    };
    useEffect(() => {
        async function getInfo() {
            try {
                setNotificationAccountName('Đang load tên chủ tài khoản');
                setValidateStatusName('validating' as ValidateStatus);
                const info = await accountInformationApi({
                    group_id,
                    store_id,
                    bankCode: formTransfer.getFieldValue('bankCode'),
                    accountNo: formTransfer.getFieldValue('accountNo'),
                    accountType: formTransfer.getFieldValue('accountType'),
                });
                formTransfer.setFieldsValue({
                    accountName: info.data.accountName,
                });
                setNotificationAccountName('');
                setValidateStatusName('success' as ValidateStatus);
            } catch (error) {
                formTransfer.setFieldsValue({
                    accountName: '',
                });
                setNotificationAccountName('Thông tin tài khoản không đúng hoặc tài khoản không tồn tại');
                setValidateStatusName('error' as ValidateStatus);
            }
        }
        if (
            formTransfer.getFieldValue('accountNo') &&
            formTransfer.getFieldValue('bankCode') &&
            formTransfer.getFieldValue('accountType') &&
            isShowModalTransfer
        ) {
            getInfo();
        }
        setErrMessageText(false);
    }, [isShowModalTransfer, onChangeInfo]);
    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={8}>
                    <Space direction="vertical">
                        <Statistic
                            loading={LoadingTurnover}
                            title="Doanh thu hiện có"
                            value={dataStateTurnover?.balance}
                            prefix={<DollarOutlined />}
                        />
                        <Button type="primary" onClick={handleModalTransfer}>
                            Rút tiền về ngân hàng
                        </Button>
                    </Space>
                </Col>
                <Col xs={24} sm={12} md={16}>
                    <List
                        loading={LoadingActionLog}
                        size="small"
                        header={<strong>Lịch sử rút tiền gần đây</strong>}
                        bordered
                        dataSource={dataStateActionLog}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={
                                        <span>
                                            <a>{item.user_name}</a> {item.name} <strong>{item.order_id}</strong>
                                        </span>
                                    }
                                    description={moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                />
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
            <Modal isShowModal={isShowModalTransfer} hideModal={handleModalTransfer}>
                <Form form={formTransfer} name="basic" layout="vertical" onFinish={onSubmiTransfer}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={10}>
                            <Divider orientation="left">Ngân hàng đã lưu</Divider>
                            <Row gutter={[8, 8]} style={{ margin: 0 }}>
                                {dataWithdrawal?.data?.map((item) => {
                                    return (
                                        <Col span={8} key={item.bankCode}>
                                            <div
                                                className={
                                                    bankCode === item.bankCode ? 'bank-code active' : 'bank-code'
                                                }
                                                onClick={() => onHandleBankCode(item)}
                                            >
                                                <Image
                                                    preview={false}
                                                    src={`https://s3.kstorage.vn/qrpayment/bankcode/${item.bankCode}.png`}
                                                    height={60}
                                                    width={80}
                                                />
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Col>
                        <Col xs={24} sm={14}>
                            <Form.Item label="Ngân hàng" name="bankCode" required>
                                <Select
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngân hàng"
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange={() => {
                                        setOnChangeInfo(!onChangeInfo);
                                    }}
                                >
                                    {listBank().map((item) => {
                                        return (
                                            <Option key={item.code} value={item.code}>
                                                {item.name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item label="Chuyển qua" name="accountType" required>
                                <Radio.Group
                                    onChange={() => {
                                        setOnChangeInfo(!onChangeInfo);
                                    }}
                                >
                                    <Radio value="account">Số tài khoản</Radio>
                                    <Radio value="card">Số thẻ</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="Số thẻ / tài khoản" name="accountNo" required>
                                <Input
                                    required
                                    onBlur={() => {
                                        setOnChangeInfo(!onChangeInfo);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tên chủ thẻ"
                                name="accountName"
                                required
                                validateStatus={validateStatusName}
                                help={notificationAccountName}
                            >
                                <Input required />
                            </Form.Item>
                            <Form.Item label="Số điện thoại" name="customerPhoneNumber">
                                <Input />
                            </Form.Item>
                            <Form.Item label="Số tiền" name="amount" required>
                                <InputNumber
                                    required
                                    formatter={(value) => `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="message"
                                required
                                label="Lời nhắn"
                                tooltip="Không có dấu và ký tự đặt biệt"
                                hasFeedback={errMessageText && true}
                                validateStatus={errMessageText ? 'error' : 'success'}
                                help={errMessageText && 'Lời nhắn là tiếng việt không dấu'}
                            >
                                <Input
                                    placeholder="Tiếng việt không dấu không có ký tự đặc biệt"
                                    maxLength={100}
                                    onChange={() => {
                                        setErrMessageText(false);
                                    }}
                                    onBlur={(e) => {
                                        if (!checkValidateInput(e.target.value)) {
                                            setErrMessageText(true);
                                        }
                                    }}
                                />
                            </Form.Item>
                            <Form.Item label="Mã OTP" name="token" tooltip="Mã OTP khi lúc bạn đăng nhập">
                                <Input />
                            </Form.Item>
                            <Form.Item name="remember" valuePropName="checked">
                                <Checkbox>Lưu lại thông tin tài khoản</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button block type="primary" htmlType="submit" loading={loadingSubmit}>
                        Chuyển khoản
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RevenueManagement;
