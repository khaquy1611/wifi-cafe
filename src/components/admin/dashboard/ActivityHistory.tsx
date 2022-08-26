import React from 'react';
import moment from 'moment';
import { List, Avatar, Typography } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { setCookie } from 'nookies';
import { ActionLogDataType } from 'api/types';

const { Title } = Typography;

interface PropsType {
    serverOrderActions?: ActionLogDataType[];
}

const ActivityHistory = ({ serverOrderActions }: PropsType) => {
    return (
        <div className="box-dashboard-admin">
            <Title level={5}>
                <HistoryOutlined /> Hoạt động gần đây
            </Title>
            <List
                className="list-item-notification"
                dataSource={serverOrderActions}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    shape="square"
                                    size={32}
                                    src={`https://s3.kstorage.vn/qrpayment/common/${item?.type}.png`}
                                />
                            }
                            title={
                                <span
                                    onClick={() =>
                                        setCookie(null, 'customer_name', item.user_name, {
                                            path: '/',
                                        })
                                    }
                                >
                                    <a target="blank" href={`/admin/profile?id=${item.user_id}`}>
                                        {item.user_name}
                                    </a>{' '}
                                    {item.name} <strong>{item.order_id}</strong>
                                </span>
                            }
                            description={moment(item.createdAt).fromNow()}
                        />
                    </List.Item>
                )}
                rowKey="_id"
            />
        </div>
    );
};

export default ActivityHistory;
