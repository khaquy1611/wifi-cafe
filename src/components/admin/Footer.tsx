import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterAdmin = () => {
    return <Footer style={{ textAlign: 'center' }}>Wifi Cà Phê ©{new Date().getFullYear()}</Footer>;
};

export default FooterAdmin;
