import React, { useState } from 'react';
import { Dropdown, Menu, Typography, Tag, Button, Modal, Affix, message } from 'antd';
import {
    EllipsisOutlined,
    RightCircleOutlined,
    AlertOutlined,
    CreditCardOutlined,
    SwapOutlined,
    CloseOutlined,
    BellFilled,
} from '@ant-design/icons';
import { parseCookies } from 'nookies';
import { DepartmentDataType } from 'api/types';
import { CardType } from 'reduxStore/cardTabs/types';
import { pushNotifyUserApi } from 'api/client';

const { Title, Text } = Typography;

interface PropsType {
    resetLoadingAndModal: (v: number) => void;
    onSubmitChangeOrderStatusService: (type: 'complete_service' | 'complete_payment') => void;
    card: CardType | undefined;
    serverDataDepartment: DepartmentDataType[] | undefined;
    statusAction: boolean;
    onTitleClick: () => void;
    containerCart: HTMLDivElement | null;
}

const HeaderOrderTab = ({
    containerCart,
    onTitleClick,
    statusAction,
    card,
    serverDataDepartment,
    onSubmitChangeOrderStatusService,
    resetLoadingAndModal,
}: PropsType) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

    const { group_id, store_id } = parseCookies();

    const menu = (
        <Menu>
            <Menu.Item
                key="complete_service"
                onClick={() => {
                    onSubmitChangeOrderStatusService('complete_service');
                }}
            >
                <AlertOutlined /> Đã giao món
            </Menu.Item>
            <Menu.Item
                key="complete_payment"
                onClick={() => {
                    onSubmitChangeOrderStatusService('complete_payment');
                }}
            >
                <CreditCardOutlined /> Đã thanh toán
            </Menu.Item>
            <Menu.Divider />
            {card?.status_order === 'at-place' && (
                <Menu.Item key="complete_payment" onClick={() => resetLoadingAndModal(1)}>
                    <SwapOutlined /> Đổi bàn
                </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item key="cancel_order" onClick={() => resetLoadingAndModal(2)}>
                <Text type="danger">
                    <CloseOutlined /> Huỷ đơn
                </Text>
            </Menu.Item>
        </Menu>
    );
    const handlePushNotify = async () => {
        setIsModalVisible(true);
        try {
            await pushNotifyUserApi({ customer_id: card?.customer_id, group_id, store_id, order_id: card?._id });
        } finally {
            setTimeout(() => {
                setIsModalVisible(false);
                message.success(`Đã gửi thông báo tới khách hàng ${card?.customer_name}`);
            }, 2000);
        }
    };
    return (
        <Affix offsetTop={0} target={() => containerCart}>
            <div className="headerSidebar">
                <div className="headerSidebar_Inner">
                    <div className="headerSidebar_Title">
                        <div className="headerSidebar_Name" onClick={onTitleClick}>
                            <Title style={{ marginBottom: 0, cursor: 'pointer' }} level={4}>
                                {statusAction ? (
                                    'Đơn mang đi'
                                ) : (
                                    <>
                                        {card?.tableState ? (
                                            <>
                                                {
                                                    serverDataDepartment
                                                        ?.find((item) =>
                                                            item.subDepartment.find(
                                                                (table) => table._id === card?.tableState,
                                                            ),
                                                        )
                                                        ?.subDepartment.find((table) => table._id === card?.tableState)
                                                        ?.name
                                                }
                                                {' - '}
                                                {
                                                    serverDataDepartment?.find((item) =>
                                                        item.subDepartment.find(
                                                            (table) => table._id === card?.tableState,
                                                        ),
                                                    )?.name
                                                }
                                            </>
                                        ) : (
                                            'Click để chọn bàn'
                                        )}
                                        {!card?._id && <RightCircleOutlined className="headerSidebar_Icon" />}
                                    </>
                                )}
                            </Title>
                        </div>
                        {card?._id && card?.status !== 'completed' && card?.status !== 'cancelled' && (
                            <div className="headerSidebar_Action">
                                <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                                    <EllipsisOutlined style={{ fontSize: 24 }} />
                                </Dropdown>
                            </div>
                        )}
                    </div>
                    <div className="listBox">
                        {card?._id && (
                            <div className="listBox_Item">
                                <div style={{ fontWeight: 'bold' }}>Mã đơn hàng: {card?.orderId}</div>
                                {card?.status === 'completed' && (
                                    <Tag color="#0fa44a" style={{ margin: 0 }}>
                                        Thành công
                                    </Tag>
                                )}
                                {card?.status === 'cancelled' && (
                                    <Tag color="#ff4d4f" style={{ margin: 0 }}>
                                        Đã huỷ đơn
                                    </Tag>
                                )}
                            </div>
                        )}
                        <div className="listBox_Item">
                            Trạng thái thanh toán:{' '}
                            <a>
                                {card?.status_payment === 'completed' ? (
                                    <Tag color="green" style={{ margin: 0, borderRadius: 12 }}>
                                        Đã thanh toán
                                    </Tag>
                                ) : (
                                    <Tag color="orange" style={{ margin: 0, borderRadius: 12 }}>
                                        Chưa thanh toán
                                    </Tag>
                                )}
                            </a>
                        </div>
                        <div className="listBox_Item">
                            <div>
                                Số thẻ nhận đồ: <a style={{ fontWeight: 'bold' }}>#{card?.order_code}</a>
                            </div>
                            {card?._id && (card?.customer_id !== '0' || card?.platform) && (
                                <Button
                                    type="primary"
                                    shape="round"
                                    size="small"
                                    // className="listBox_Item"
                                    onClick={handlePushNotify}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <BellFilled /> <span style={{ fontSize: 12 }}>Gọi khách nhận đồ</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Modal visible={isModalVisible} footer={null} closable={false} centered width={320}>
                <div className="box-ring">
                    <div className="box-ring-phone">
                        <i className="Phone is-animating" />
                    </div>
                    <div className="box-ring-phone-des">Đang gửi thông báo tới khách hàng</div>
                </div>
            </Modal>
        </Affix>
    );
};

export default HeaderOrderTab;
