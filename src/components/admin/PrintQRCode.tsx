import React from 'react';
import { Col, Row } from 'antd';
import QRCode from 'qrcode.react';
import { SubDepartmentDataType } from 'api/types';

interface Props {
    data: SubDepartmentDataType[];
    header: string;
    group_ws: string;
}

export default class TemplateQRCode extends React.PureComponent<Props> {
    render() {
        const { data, header } = this.props;
        return (
            <div style={{ backgroundColor: '#f0f0f0', textAlign: 'center', paddingTop: 15 }}>
                <h1>Danh sách QR-Code tại {header}</h1>
                <Row gutter={[12, 12]}>
                    {data.map((item) => {
                        return (
                            <Col span={8} key={item._id}>
                                <div style={{ padding: '24px 6px 12px', backgroundColor: '#fff', textAlign: 'center' }}>
                                    {item.active ? (
                                        <QRCode
                                            size={200}
                                            fgColor="#0fa44a"
                                            value={`${process.env.API_URL}/welcome?q=${item.id}`}
                                        />
                                    ) : (
                                        <QRCode
                                            imageSettings={{
                                                src: 'https://s3.kstorage.vn/qrpayment/common/close-store.png',
                                                height: 64,
                                                width: 64,
                                                excavate: false,
                                            }}
                                            size={200}
                                            renderAs="svg"
                                            fgColor="#0fa44a"
                                            value={`${process.env.API_URL}/welcome?q=${item.id}`}
                                        />
                                    )}
                                    <div style={{ fontSize: 16, paddingTop: 6 }}>{item.name}</div>
                                    <div>(Quét mã để đặt món)</div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );
    }
}
