import React from 'react';
import { useRouter } from 'next/router';
import { Result, Tag } from 'antd';

const Redirect = () => {
    const router = useRouter();
    const {
        query: { errorCode, message, orderCodeTable },
    } = router;

    if (!Number(errorCode)) {
        return (
            <Result
                className="web-admin-result-sidebar page-404"
                status="success"
                title="Giao dịch thành công"
                subTitle={
                    <div>
                        Đơn hàng đã được thanh toán
                        <div>Quý khách đến quầy để nhận đồ</div>
                        <div>Số thẻ bàn để nhận đồ uống</div>
                        <Tag color="#f50">#{orderCodeTable}</Tag>
                    </div>
                }
            />
        );
    }
    return (
        <Result
            className="web-admin-result-sidebar page-404"
            status="error"
            title="Giao dịch thất bại"
            subTitle={
                <div>
                    Đơn hàng chưa được thanh toán
                    <div>Mã lỗi: {message}</div>
                    <div>Quý khách vui lòng chọn lại món và thanh toán lại hoặc liên hệ nhân viên để được hỗ trợ</div>
                </div>
            }
        />
    );
};

export default Redirect;
