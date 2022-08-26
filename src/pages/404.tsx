import React from 'react';
import { Result } from 'antd';

export default function Custom404() {
    return (
        <Result className="web-admin-result-sidebar page-404" status="404" title="404" subTitle="Trang không tồn tại" />
    );
}
