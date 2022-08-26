import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { login, logout } from 'reduxStore/login/actions';
import { getActionLog } from 'reduxStore/actionLog/actions';
import { getGroupShops } from 'reduxStore/groupShops/actions';
import { getNotification } from 'reduxStore/notification/actions';
import { NotificationDataType } from 'api/types';
import { readNotify } from 'api/store';
import {
    Layout,
    Row,
    Col,
    Popover,
    Badge,
    Avatar,
    Menu,
    List,
    Space,
    Button,
    Tooltip,
    Affix,
    message,
    Alert,
} from 'antd';
import {
    LogoutOutlined,
    BellOutlined,
    NotificationOutlined,
    HistoryOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    ProfileOutlined,
} from '@ant-design/icons';
import { parseCookies } from 'nookies';
import Link from 'next/link';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { availableLinks } from 'common';

const { Header } = Layout;

interface Props {
    socket?: SocketIOClient.Socket;
    handleOrderDetail?: (_id: string, order_id?: string) => void;
}

const HeaderAdmin = ({ socket, handleOrderDetail }: Props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { admin_id, group_id, store_id } = parseCookies();

    const {
        result: { data: dataLogin },
    } = useSelector((state: ApplicationState) => state.login);

    const {
        result: { data: dataActionLog },
    } = useSelector((state: ApplicationState) => state.actionLog);

    const {
        result: { data: dataNotification },
    } = useSelector((state: ApplicationState) => state.notification);

    const {
        result: { data: dataGroupShops },
    } = useSelector((state: ApplicationState) => state.groupShops);

    const {
        result: { data: dataGroupStores },
    } = useSelector((state: ApplicationState) => state.groupStores);

    useEffect(() => {
        if (group_id && store_id) {
            (async function immediatelyInvokedFunction() {
                if (admin_id) dispatch(login(admin_id));
                if (isEmpty(dataGroupShops)) dispatch(getGroupShops(group_id));
            })();
        }
    }, [dataGroupShops]);

    useEffect(() => {
        if (
            router.pathname !== '/admin/sales' &&
            router.pathname !== '/admin/actions' &&
            dataLogin &&
            dataLogin?.role !== 'ADMIN' &&
            group_id &&
            store_id &&
            router.pathname !== '/admin/profile'
        )
            dispatch(getActionLog({ group_id, store_id }));
    }, [dataLogin, router.pathname]);

    const dataObject = new Map(dataGroupShops?.map((element) => [element._id, element])).get(store_id);

    const menu = (
        <Menu>
            <Menu.Item>
                <Link href={`/admin/profile?id=${admin_id}`}>
                    <a>
                        <ProfileOutlined /> Thông tin cá nhân
                    </a>
                </Link>
            </Menu.Item>
            <Menu.Item
                icon={<LogoutOutlined />}
                onClick={() => {
                    dispatch(logout(admin_id));
                }}
            >
                Đăng xuất
            </Menu.Item>
        </Menu>
        // <div style={{ cursor: 'pointer' }}>
        //     <div>

        //     </div>
        //     <div
        //         onClick={() => {
        //             dispatch(logout(admin_id));
        //         }}
        //     >
        //         <LogoutOutlined /> Đăng xuất
        //     </div>
        // </div>
    );
    const actionLogRender = () => (
        <List
            className="list-item-notification-web"
            dataSource={dataActionLog}
            loadMore={
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 12,
                        marginBottom: 12,
                    }}
                >
                    <Button size="small">
                        <Link href="/admin/actions">Xem thêm</Link>
                    </Button>
                </div>
            }
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        avatar={
                            <Avatar shape="square" src={`https://s3.kstorage.vn/qrpayment/common/${item.type}.png`} />
                        }
                        title={
                            <span>
                                <Link href={`/admin/profile?id=${item.user_id}`}>{item.user_name}</Link> {item.name}{' '}
                                <strong>{item.order_id}</strong>
                            </span>
                        }
                        description={moment(item.createdAt).fromNow()}
                    />
                </List.Item>
            )}
            rowKey="_id"
        />
    );

    const onNotifyReadClick = async (notify?: NotificationDataType) => {
        try {
            if (notify) {
                if (notify?.orderId && handleOrderDetail) handleOrderDetail(notify?.orderId, notify?.order_id);
                if (notify?.unread) {
                    await readNotify({ group_id, store_id, ...(notify?._id ? { notify_id: notify._id } : null) });
                    dispatch(getNotification(group_id, store_id));
                    if (socket) socket.emit('staffOnWeb', { room: store_id });
                }
            } else {
                await readNotify({ group_id, store_id });
                dispatch(getNotification(group_id, store_id));
                if (socket) socket.emit('staffOnWeb', { room: store_id });
            }
        } catch (err) {
            message.error((err as Error).message);
        }
    };

    const notificationRender = () => (
        <List
            className="list-item-notification-web"
            dataSource={dataNotification}
            renderItem={(item) => (
                <List.Item
                    onClick={() => onNotifyReadClick(item)}
                    style={{ cursor: 'pointer', backgroundColor: item.unread ? 'aliceblue' : '#fff' }}
                >
                    <List.Item.Meta
                        avatar={
                            <Avatar
                                shape="square"
                                size={32}
                                src={`https://s3.kstorage.vn/qrpayment/action/${item.icon}.png`}
                            />
                        }
                        title={item.message}
                        description={moment(item.createdAt).fromNow()}
                    />
                </List.Item>
            )}
            rowKey="_id"
        />
    );
    return (
        <Affix offsetTop={0}>
            <Header className="header-cms-admin">
                <Row>
                    <Col span={10}>
                        <div style={{ paddingLeft: 24 }}>
                            {dataGroupStores?.length !== 1 || dataGroupShops?.length !== 1 ? (
                                // chỗ này cần sửa
                                <Link href="/admin/overview">
                                    <a style={{ color: '#fff' }}>
                                        <Tooltip title="Đi đến trang tổng quan">
                                            <Avatar src={dataObject?.logo} /> {dataObject?.name}
                                            {dataObject?.active ? (
                                                ''
                                            ) : (
                                                <Avatar
                                                    shape="square"
                                                    src="https://s3.kstorage.vn/qrpayment/common/close-store.png"
                                                />
                                            )}
                                        </Tooltip>
                                    </a>
                                </Link>
                            ) : (
                                <>
                                    <Avatar src={dataObject?.logo} /> {dataObject?.name}
                                </>
                            )}
                        </div>
                    </Col>
                    <Col span={14}>
                        <div style={{ textAlign: 'right', paddingRight: 24 }}>
                            <Space size="middle">
                                {(dataLogin?.role !== 'ADMIN' || dataLogin?.permissions?.includes('sales')) && (
                                    <div
                                        onClick={() => {
                                            window.location.href =
                                                router.pathname === '/admin/sales'
                                                    ? availableLinks(dataLogin)
                                                    : '/admin/sales';
                                        }}
                                        // href={
                                        //     router.pathname === '/admin/sales'
                                        //         ? availableLinks(dataLogin)
                                        //         : '/admin/sales'
                                        // }
                                    >
                                        <a style={{ color: '#fff' }}>
                                            {(dataLogin?.role !== 'ADMIN' ||
                                                dataLogin?.permissions?.includes('sales')) && (
                                                <Tooltip
                                                    title={
                                                        router.pathname === '/admin/sales' ? 'Dashboard' : 'Bán hàng'
                                                    }
                                                >
                                                    {router.pathname === '/admin/sales' ? (
                                                        <Button
                                                            className="cms-header-notification"
                                                            shape="circle"
                                                            icon={<AppstoreOutlined />}
                                                        />
                                                    ) : (
                                                        <Button
                                                            className="cms-header-notification"
                                                            shape="circle"
                                                            icon={<ShoppingOutlined />}
                                                        />
                                                    )}
                                                </Tooltip>
                                            )}
                                        </a>
                                    </div>
                                )}
                                {dataLogin?.role !== 'ADMIN' &&
                                    router.pathname !== '/admin/sales' &&
                                    router.pathname !== '/admin/profile' &&
                                    router.pathname !== '/admin/actions' && (
                                        <Popover
                                            placement="bottomRight"
                                            content={actionLogRender}
                                            trigger="click"
                                            title={
                                                <div className="notification-web">
                                                    <HistoryOutlined />
                                                    <span style={{ paddingLeft: 6 }}>Lịch sử hoạt động</span>
                                                </div>
                                            }
                                        >
                                            <Badge count={dataActionLog?.length}>
                                                <Tooltip title="Lịch sử hoạt động">
                                                    <Button
                                                        className="cms-header-notification"
                                                        shape="circle"
                                                        icon={<HistoryOutlined />}
                                                    />
                                                </Tooltip>
                                            </Badge>
                                        </Popover>
                                    )}
                                {router.pathname === '/admin/sales' && (
                                    <Popover
                                        placement="bottomRight"
                                        content={notificationRender}
                                        trigger="click"
                                        title={
                                            <div className="notification-web">
                                                <Space
                                                    align="center"
                                                    style={{ width: '100%', justifyContent: 'space-between' }}
                                                >
                                                    <span style={{ paddingLeft: 6 }}>
                                                        <NotificationOutlined /> Thông báo
                                                    </span>
                                                    <Button type="link" onClick={() => onNotifyReadClick()}>
                                                        Đánh dấu đã đọc
                                                    </Button>
                                                </Space>
                                            </div>
                                        }
                                    >
                                        <Badge count={dataNotification?.filter((item) => item.unread).length}>
                                            <Tooltip title="Thông báo về đơn hàng">
                                                <Button
                                                    className="cms-header-notification"
                                                    shape="circle"
                                                    icon={<BellOutlined />}
                                                />
                                            </Tooltip>
                                        </Badge>
                                    </Popover>
                                )}
                                <Popover placement="bottomRight" content={menu} trigger="click">
                                    <span style={{ cursor: 'pointer' }}>
                                        <Avatar src={dataLogin?.avatar} /> {dataLogin?.name}
                                    </span>
                                </Popover>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Header>
            {dataObject?.active === false && (
                <Alert closable description={`Cửa Hàng ${dataObject?.name} Đã Đóng Cửa`} type="error" message="" />
            )}
        </Affix>
    );
};

export default HeaderAdmin;
