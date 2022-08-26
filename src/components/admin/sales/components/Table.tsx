import React from 'react';
import { Row, Col, Dropdown, Menu, Avatar } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { DepartmentDataType, SubDepartmentDataType } from 'api/types';
import { isEmpty } from 'lodash';

interface PropsType {
    departmentState?: string | 'all';
    departmentStatusState?: string | 'all';
    departmentRequestState?: string | 'all';
    tickTable?: string;
    onTableClick: (table: SubDepartmentDataType) => void;
    onMenuClick?: (table: SubDepartmentDataType, type: 'reset' | 'service') => Promise<void>;
    tablesData: DepartmentDataType[] | undefined;
    isShowModal?: boolean;
}

const Table = ({
    departmentState = 'all',
    departmentStatusState = 'all',
    departmentRequestState = 'all',
    tickTable,
    onTableClick,
    onMenuClick,
    tablesData,
    isShowModal,
}: PropsType) => {
    const tables = tablesData?.filter((item) => {
        if (departmentState === 'all') return item;
        return item._id === departmentState;
    });

    return (
        <div className={isShowModal ? 'modal-table' : ''}>
            {tables?.map((item) => (
                <div key={item._id}>
                    <div className="bxHeader">
                        <div className="bxHeader_Inner">
                            {item.name} (
                            {
                                item.subDepartment
                                    .filter((item) => {
                                        if (departmentStatusState === 'all') return item;
                                        return item.status === departmentStatusState;
                                    })
                                    .filter((item) => {
                                        if (departmentRequestState === 'all') return item;
                                        return item.request === departmentRequestState;
                                    }).length
                            }{' '}
                            bàn)
                            {!item.active && (
                                <Avatar src="https://s3.kstorage.vn/qrpayment/common/close-store.png" shape="square" />
                            )}
                        </div>
                    </div>
                    <div className="listTable">
                        <Row gutter={[12, 12]}>
                            {item.subDepartment
                                .filter((item) => {
                                    if (departmentStatusState === 'all') return item;
                                    return item.status === departmentStatusState;
                                })
                                .filter((item) => {
                                    if (departmentRequestState === 'all') return item;
                                    return item.request === departmentRequestState;
                                })
                                .map((table) => (
                                    <Col
                                        className="gutter-row"
                                        xs={24}
                                        sm={24}
                                        md={12}
                                        lg={isShowModal ? 12 : 8}
                                        xl={isShowModal ? 12 : 6}
                                        xxl={isShowModal ? 12 : 4}
                                        key={table._id}
                                    >
                                        <div
                                            className={table.status === 'at-place' ? ' cardTable' : ' cardTable'}
                                            onClick={() => onTableClick(table)}
                                        >
                                            <div className="viewTable">
                                                {table.status === 'at-place' ? (
                                                    <svg
                                                        viewBox="0 0 83 58"
                                                        version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <title>table</title>
                                                        <g
                                                            id="Page-1"
                                                            stroke="none"
                                                            strokeWidth="1"
                                                            fill="none"
                                                            fillRule="evenodd"
                                                        >
                                                            <g id="Group-2">
                                                                <rect
                                                                    id="Rectangle"
                                                                    strokeOpacity="0.5"
                                                                    stroke="#11863F"
                                                                    fill="#6CD096"
                                                                    x="4.5"
                                                                    y="4.5"
                                                                    width="74"
                                                                    height="49"
                                                                    rx="6"
                                                                />
                                                                <path
                                                                    d="M36.9840829,54 L36.9840829,56 C36.9840829,57.1045695 36.0886524,58 34.9840829,58 L22.9840829,58 C21.8795134,58 20.9840829,57.1045695 20.9840829,56 L20.9840829,54 L36.9840829,54 Z M63.9840829,54 L63.9840829,56 C63.9840829,57.1045695 63.0886524,58 61.9840829,58 L49.9840829,58 C48.8795134,58 47.9840829,57.1045695 47.9840829,56 L47.9840829,54 L63.9840829,54 Z M4,21 L4,37 L2,37 C0.8954305,37 1.3527075e-16,36.1045695 0,35 L0,23 C-1.3527075e-16,21.8954305 0.8954305,21 2,21 L4,21 Z M81,21 C82.1045695,21 83,21.8954305 83,23 L83,35 C83,36.1045695 82.1045695,37 81,37 L79,37 L79,21 L81,21 Z M34.9840829,0 C36.0886524,-2.02906125e-16 36.9840829,0.8954305 36.9840829,2 L36.9840829,4 L20.9840829,4 L20.9840829,2 C20.9840829,0.8954305 21.8795134,2.02906125e-16 22.9840829,0 L34.9840829,0 Z M61.9840829,0 C63.0886524,-2.02906125e-16 63.9840829,0.8954305 63.9840829,2 L63.9840829,4 L47.9840829,4 L47.9840829,2 C47.9840829,0.8954305 48.8795134,2.02906125e-16 49.9840829,0 L61.9840829,0 Z"
                                                                    id="Combined-Shape"
                                                                    fill="#0FA44A"
                                                                />
                                                                <rect
                                                                    id="Rectangle"
                                                                    fill="#11863F"
                                                                    x="21"
                                                                    y="3"
                                                                    width="16"
                                                                    height="1"
                                                                />
                                                                <rect
                                                                    id="Rectangle-Copy-10"
                                                                    fill="#11863F"
                                                                    x="48"
                                                                    y="3"
                                                                    width="16"
                                                                    height="1"
                                                                />
                                                                <rect
                                                                    id="Rectangle-Copy-12"
                                                                    fill="#11863F"
                                                                    x="21"
                                                                    y="54"
                                                                    width="16"
                                                                    height="1"
                                                                />
                                                                <rect
                                                                    id="Rectangle-Copy-11"
                                                                    fill="#11863F"
                                                                    x="48"
                                                                    y="54"
                                                                    width="16"
                                                                    height="1"
                                                                />
                                                            </g>
                                                            <rect
                                                                id="Rectangle"
                                                                fill="#11863F"
                                                                x="79"
                                                                y="21"
                                                                width="1"
                                                                height="16"
                                                            />
                                                            <rect
                                                                id="Rectangle-Copy-13"
                                                                fill="#11863F"
                                                                x="3"
                                                                y="21"
                                                                width="1"
                                                                height="16"
                                                            />
                                                        </g>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        viewBox="0 0 83 58"
                                                        version="1.1"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g
                                                            id="Page-1"
                                                            stroke="none"
                                                            strokeWidth="1"
                                                            fill="none"
                                                            fillRule="evenodd"
                                                        >
                                                            <g id="Group-2-Copy" fill="#FFFFFF" stroke="#8590A6">
                                                                <rect
                                                                    id="Rectangle"
                                                                    x="4.5"
                                                                    y="4.5"
                                                                    width="74"
                                                                    height="49"
                                                                    rx="6"
                                                                />
                                                                <path
                                                                    d="M36.4840829,54.5 L36.4840829,56 C36.4840829,56.4142136 36.3161897,56.7892136 36.0447431,57.0606602 C35.7732965,57.3321068 35.3982965,57.5 34.9840829,57.5 L34.9840829,57.5 L22.9840829,57.5 C22.5698693,57.5 22.1948693,57.3321068 21.9234227,57.0606602 C21.6519761,56.7892136 21.4840829,56.4142136 21.4840829,56 L21.4840829,56 L21.4840829,54.5 L36.4840829,54.5 Z M63.4840829,54.5 L63.4840829,56 C63.4840829,56.4142136 63.3161897,56.7892136 63.0447431,57.0606602 C62.7732965,57.3321068 62.3982965,57.5 61.9840829,57.5 L61.9840829,57.5 L49.9840829,57.5 C49.5698693,57.5 49.1948693,57.3321068 48.9234227,57.0606602 C48.6519761,56.7892136 48.4840829,56.4142136 48.4840829,56 L48.4840829,56 L48.4840829,54.5 L63.4840829,54.5 Z M3.5,21.5 L3.5,36.5 L2,36.5 C1.58578644,36.5 1.21078644,36.3321068 0.939339828,36.0606602 C0.667893219,35.7892136 0.5,35.4142136 0.5,35 L0.5,35 L0.5,23 C0.5,22.5857864 0.667893219,22.2107864 0.939339828,21.9393398 C1.21078644,21.6678932 1.58578644,21.5 2,21.5 L2,21.5 L3.5,21.5 Z M81,21.5 C81.4142136,21.5 81.7892136,21.6678932 82.0606602,21.9393398 C82.3321068,22.2107864 82.5,22.5857864 82.5,23 L82.5,23 L82.5,35 C82.5,35.4142136 82.3321068,35.7892136 82.0606602,36.0606602 C81.7892136,36.3321068 81.4142136,36.5 81,36.5 L81,36.5 L79.5,36.5 L79.5,21.5 Z M34.9840829,0.5 C35.3982965,0.5 35.7732965,0.667893219 36.0447431,0.939339828 C36.3161897,1.21078644 36.4840829,1.58578644 36.4840829,2 L36.4840829,2 L36.4840829,3.5 L21.4840829,3.5 L21.4840829,2 C21.4840829,1.58578644 21.6519761,1.21078644 21.9234227,0.939339828 C22.1948693,0.667893219 22.5698693,0.5 22.9840829,0.5 L22.9840829,0.5 Z M61.9840829,0.5 C62.3982965,0.5 62.7732965,0.667893219 63.0447431,0.939339828 C63.3161897,1.21078644 63.4840829,1.58578644 63.4840829,2 L63.4840829,2 L63.4840829,3.5 L48.4840829,3.5 L48.4840829,2 C48.4840829,1.58578644 48.6519761,1.21078644 48.9234227,0.939339828 C49.1948693,0.667893219 49.5698693,0.5 49.9840829,0.5 L49.9840829,0.5 Z"
                                                                    id="Combined-Shape"
                                                                />
                                                            </g>
                                                        </g>
                                                    </svg>
                                                )}
                                                <div className="viewTable_Inner">
                                                    <div
                                                        className={
                                                            table.status === 'at-place'
                                                                ? 'viewTable_Info active'
                                                                : 'viewTable_Info'
                                                        }
                                                    >
                                                        <div className="viewTable_Name">{table.name}</div>
                                                        <div className="viewTable_Chair">({table.chair} chỗ ngồi)</div>
                                                        {!table.active && (
                                                            <Avatar
                                                                src="https://s3.kstorage.vn/qrpayment/common/close-store.png"
                                                                shape="square"
                                                                className="viewTable_Close"
                                                            />
                                                        )}
                                                        {tickTable === table._id && (
                                                            <Avatar
                                                                src="https://s3.kstorage.vn/qrpayment/common/tick.png"
                                                                className="viewTable_Close"
                                                            />
                                                        )}
                                                        {!isEmpty(table.orders) && (
                                                            <div className="viewTable_Order">
                                                                {table.orders.length} đơn
                                                            </div>
                                                        )}
                                                        <div className="loaddingWrap show">
                                                            {table.request && (
                                                                <>
                                                                    <div className="lds-ripple">
                                                                        <div />
                                                                        <div />
                                                                    </div>
                                                                    <div className="alert">
                                                                        {table.name}
                                                                        <br /> {table.request}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {!isShowModal && onMenuClick && (
                                                <div className="viewMore" onClick={(e) => e.stopPropagation()}>
                                                    <Dropdown
                                                        overlay={
                                                            <Menu>
                                                                <Menu.Item
                                                                    onClick={() => onMenuClick(table, 'reset')}
                                                                    key="complete_service"
                                                                >
                                                                    Đặt là bàn trống
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    onClick={() => onMenuClick(table, 'service')}
                                                                    key="complete_payment"
                                                                >
                                                                    Đã xử lý yêu cầu
                                                                </Menu.Item>
                                                            </Menu>
                                                        }
                                                        trigger={['click']}
                                                        placement="bottomRight"
                                                    >
                                                        <EllipsisOutlined style={{ fontSize: 25 }} />
                                                    </Dropdown>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                ))}
                        </Row>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Table;
