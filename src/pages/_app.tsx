import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import wrapper from 'reduxStore';
import moment from 'moment';
import { parseCookies } from 'nookies';
import { ReactReduxContext, Provider } from 'react-redux';
import { Layout, message, ConfigProvider } from 'antd';
import SideBarAdmin from 'components/admin/SideBar';
import vi_VN from 'antd/lib/locale-provider/vi_VN';
import FooterAdmin from 'components/admin/Footer';
import HeaderAdmin from 'components/admin/Header';

import 'assets/client.less';
import 'assets/cms.less';
import 'assets/cmsweb.less';
import 'assets/nprogress.less';

moment.updateLocale('vi', {
    relativeTime: {
        future: '%s tới',
        past: '%s trước',
        s: 'vài giây',
        ss: '%d giây',
        m: '1 phút',
        mm: '%d phút',
        h: '1 giờ',
        hh: '%d giờ',
        d: '1 ngày',
        dd: '%d ngày',
        M: '1 tháng',
        MM: '%d tháng',
        y: '1 năm',
        yy: '%d năm',
    },
});

message.config({
    duration: 2,
    maxCount: 1,
});

Router.events.on('routeChangeStart', () => {
    NProgress.start();
});
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const AppPage = ({ Component, pageProps, router }: AppProps) => {
    const { group_id, store_id } = parseCookies();

    const adminChecker =
        router.pathname !== '/admin/overview' &&
        router.pathname !== '/admin/sales' &&
        router.pathname.startsWith('/admin');

    useEffect(() => {
        if (router.pathname.includes('/admin')) {
            if (!group_id || !store_id) router.replace('/admin/overview');
        }
    }, []);

    return (
        <Layout>
            {adminChecker && <SideBarAdmin />}
            <Layout className="site-layout">
                {adminChecker && <HeaderAdmin />}
                <Component {...pageProps} />
                {adminChecker && <FooterAdmin />}
            </Layout>
        </Layout>
    );
};

const MyApp = (props: AppProps) => (
    <ReactReduxContext.Consumer>
        {({ store }) => (
            <Provider store={store}>
                <ConfigProvider locale={vi_VN}>
                    <Head>
                        <title>Đặt món bằng QRCode</title>
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                        />
                        {/* <link rel="manifest" href="/manifest.json" />
                        <link href="/icons/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
                        <link href="/icons/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
                        <link rel="apple-touch-icon" href="/apple-icon.png" />
                        <meta name="theme-color" content="#317EFB" /> */}
                        <link rel="icon" href="/favicon1.png" />
                    </Head>
                    <AppPage {...props} />
                </ConfigProvider>
            </Provider>
        )}
    </ReactReduxContext.Consumer>
);

export default wrapper.withRedux(MyApp);
