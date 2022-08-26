import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { getDepartment } from 'reduxStore/department/actions';
import { getOrders } from 'reduxStore/orders/actions';
import { chooseCardTable } from 'reduxStore/cardTabs/actions';
import { changeTableStatus } from 'api/store';
import { Row, Col, Select, Typography, Button, List, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomModal from 'components/admin/Modal';
import { DepartmentDataType, SubDepartmentDataType } from 'api/types';
import OrderCard from './OrderCard';
import Table from './components/Table';

const { Option } = Select;
const { Title } = Typography;

interface PropsType {
    orderId: string;
    options: DepartmentDataType[] | undefined;
    tablesData: DepartmentDataType[] | undefined;
    setChangeTab: (value: string) => void;
    handleOrderDetail: (orderID: string, order_id?: string) => void;
    socket: SocketIOClient.Socket;
    statusAction: boolean;
    setShowCart: (value: boolean) => void;
}

const SubDepartmentTab = ({
    orderId,
    options,
    tablesData,
    setChangeTab,
    handleOrderDetail,
    socket,
    statusAction,
    setShowCart,
}: PropsType) => {
    const dispatch = useDispatch();

    const { group_id, store_id } = useSelector((state: ApplicationState) => state.groupIDState);

    const {
        result: { cards },
    } = useSelector((state: ApplicationState) => state.cardTabs);
    const card = cards.find((item) => item.orderId === orderId);

    const [departmentState, setDepartmentState] = useState<string>('all');
    const [departmentStatusState, setDepartmentStatusState] = useState<string>('all');
    const [departmentRequestState, setDepartmentRequestState] = useState<string>('all');

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [choosenTable, setChoosenTable] = useState<SubDepartmentDataType | null>(null);

    const handleModal = () => {
        setIsShowModal(!isShowModal);
    };

    const onOrderClick = (orderID: string, order_id?: string | undefined) => {
        setIsShowModal(false);
        return handleOrderDetail(orderID, order_id);
    };

    const onTableClick = (table: SubDepartmentDataType) => {
        if (!table.orders.length) {
            if (!card?.tableState && !statusAction) {
                if (!table.active) {
                    message.error(`${table.name} tạm ngừng phục vụ`);
                    return;
                }
                dispatch(chooseCardTable({ orderId, tableId: table._id }));
                setShowCart(true);
                setChangeTab('2');
            }
        } else {
            setIsShowModal(true);
            setChoosenTable(table);
        }
    };

    const onMenuClick = async (table: SubDepartmentDataType, type: 'reset' | 'service') => {
        try {
            await changeTableStatus(
                {
                    group_id,
                    store_id,
                    department_id: table.department_id,
                    type,
                },
                table._id,
            );

            socket.emit('staffOnWeb', { room: store_id });
            dispatch(getDepartment(group_id, store_id));
            dispatch(getOrders(group_id, store_id));
            message.success(type === 'reset' ? 'Bàn đã trống!' : 'Đã xử lý yêu cầu của khách');
        } catch (err) {
            message.error(err.message);
        }
    };

    useEffect(() => {
        if (!isShowModal) setChoosenTable(null);
    }, [isShowModal]);

    return (
        <div style={{ maxHeight: 'calc(100vh - 126px)', overflow: 'auto' }}>
            <div className="web-admin-header-content">
                <Row gutter={[12, 12]} className="listForm">
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} className="itemForm">
                        <div className="itemForm_Label">Khu vực</div>
                        <Select value={departmentState} onChange={setDepartmentState} style={{ width: '100%' }}>
                            <Option value="all">Tất cả khu vực</Option>
                            {options?.map((item) => (
                                <Option key={item._id} value={item._id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} className="itemForm">
                        <div className="itemForm_Label">Trạng thái bàn</div>
                        <Select
                            value={departmentStatusState}
                            onChange={setDepartmentStatusState}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="none">Bàn trống</Option>
                            <Option value="at-place">Bàn đang sử dụng</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} className="itemForm">
                        <div className="itemForm_Label">Khách yêu cầu</div>
                        <Select
                            value={departmentRequestState}
                            onChange={setDepartmentRequestState}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Trống</Option>
                            <Option value="Gọi phục vụ">Gọi phục vụ</Option>
                            <Option value="Gọi thanh toán">Gọi thanh toán</Option>
                        </Select>
                    </Col>
                </Row>
            </div>
            <div className="web-admin-site-card-wrapper">
                <Table
                    departmentState={departmentState}
                    departmentStatusState={departmentStatusState}
                    departmentRequestState={departmentRequestState}
                    onTableClick={onTableClick}
                    onMenuClick={onMenuClick}
                    tablesData={tablesData}
                />
            </div>
            <CustomModal isShowModal={isShowModal} hideModal={handleModal} width="50%">
                <Title level={4}>{choosenTable?.name}</Title>
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <List
                        // grid={{ gutter: 12, xs: 12, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 }}
                        style={{ paddingLeft: 6, paddingRight: 6 }}
                        dataSource={choosenTable?.orders}
                        renderItem={(item) => (
                            <List.Item>
                                <OrderCard orderId={orderId} item={item} handleOrderDetail={onOrderClick} />
                            </List.Item>
                        )}
                    />
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    disabled={!choosenTable?.active || !!card?.tableState || statusAction}
                    block
                    onClick={() => {
                        if (choosenTable && !card?.tableState && !statusAction) {
                            dispatch(chooseCardTable({ orderId, tableId: choosenTable?._id }));
                            setShowCart(true);
                            setChangeTab('2');
                            setIsShowModal(false);
                        }
                    }}
                >
                    Chọn bàn
                </Button>
            </CustomModal>
        </div>
    );
};

export default SubDepartmentTab;
