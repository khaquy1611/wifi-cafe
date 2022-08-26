import React from 'react';
import { Result } from 'antd';

interface PropsType {
    message?: string;
}

export default function CustomError({ message }: PropsType) {
    return <Result className="web-admin-result-sidebar page-404" status="500" title="Thông báo" subTitle={message} />;
}
