import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'reduxStore/store';
import { Affix, Layout, Menu } from 'antd';
import {
    AreaChartOutlined,
    SettingOutlined,
    ShopOutlined,
    UserOutlined,
    HomeOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined,
    FileSearchOutlined,
    HistoryOutlined,
    LayoutOutlined,
    UserSwitchOutlined,
    TagsOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { availableLinks } from 'common';

const { Sider } = Layout;
const { SubMenu } = Menu;

const allKeys = [
    'dashboard',
    'shops',
    'config',
    'users',
    'department',
    'inventory',
    'category',
    'menu',
    'coupons',
    'orders',
    'actions',
    'customer',
    'importing',
    'exporting',
    'receipt-type',
    'historyWarehouse',
    'report',
];

const SideBarAdmin = () => {
    const router = useRouter();

    const {
        result: { data },
    } = useSelector((state: ApplicationState) => state.login);

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const [collapsed, setCollapsed] = useState<boolean>(false);

    useEffect(() => {
        allKeys.every((key) => {
            if (router.pathname.includes(key)) {
                setSelectedKeys([key]);
                return false;
            }
            return true;
        });
    }, [router.pathname]);

    const onCollapse = (collapse: boolean) => {
        setCollapsed(collapse);
    };

    return (
        <Affix offsetTop={0}>
            <Sider
                className="cms-sidebar"
                theme="light"
                breakpoint="lg"
                collapsible
                collapsedWidth={0}
                collapsed={collapsed}
                onCollapse={onCollapse}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                    <Link href={availableLinks(data)}>
                        <a>
                            <Image src="/logo.svg" width={192} height={36} />
                        </a>
                    </Link>
                </div>
                <Menu theme="light" mode="inline" selectedKeys={selectedKeys}>
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('dashboard')) && (
                        <Menu.Item key="dashboard" icon={<AreaChartOutlined />}>
                            <Link href="/admin/dashboard">
                                <a>Thống kê</a>
                            </Link>
                        </Menu.Item>
                    )}
                    <Menu.Item key="shops" icon={<ShopOutlined />}>
                        <Link href="/admin/stores/group/shops">
                            <a>Cửa hàng</a>
                        </Link>
                    </Menu.Item>
                    {data?.role !== 'ADMIN' && (
                        <>
                            <Menu.Item key="config" icon={<SettingOutlined />}>
                                <Link href="/admin/config">
                                    <a>Cài đặt</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="users" icon={<UserOutlined />}>
                                <Link href="/admin/users">
                                    <a>Quản trị viên</a>
                                </Link>
                            </Menu.Item>
                        </>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('department')) && (
                        <Menu.Item key="department" icon={<HomeOutlined />}>
                            <Link href="/admin/stores/department">
                                <a>Quản lý phòng / bàn</a>
                            </Link>
                        </Menu.Item>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('product')) && (
                        <SubMenu key="products" icon={<ShoppingCartOutlined />} title="Sản phẩm">
                            <Menu.Item key="category" icon={<UnorderedListOutlined />}>
                                <Link href="/admin/products/category">
                                    <a>Danh mục</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="menu" icon={<ShoppingCartOutlined />}>
                                <Link href="/admin/products/menu">
                                    <a>Danh sách</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="coupons" icon={<TagsOutlined />}>
                                <Link href="/admin/products/coupons">
                                    <a>Mã khuyến mãi</a>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('product')) && (
                        <SubMenu key="store" icon={<LayoutOutlined />} title="Kho hàng">
                            <Menu.Item key="inventory">
                                <Link href="/admin/store/inventory">
                                    <a>Danh sách tồn kho</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="historyWarehouse">
                                <Link href="/admin/store/historyWarehouse">
                                    <a>Lịch sử Kho Hàng</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="importing">
                                <Link href="/admin/store/importing">
                                    <a>Nhập kho</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="exporting">
                                <Link href="/admin/store/exporting">
                                    <a>Xuất kho</a>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="receipt-type">
                                <Link href="/admin/store/receipt-type">
                                    <a>Danh sách loại phiếu</a>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('report')) && (
                        <SubMenu key="report" icon={<BarChartOutlined />} title="Báo cáo">
                            <Menu.Item key="report">
                                <Link href="/admin/store/report">
                                    <a>Báo cáo kho hàng</a>
                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('sales')) && (
                        <Menu.Item key="orders" icon={<FileSearchOutlined />}>
                            <Link href="/admin/sales/orders">
                                <a>Quản lý đơn hàng</a>
                            </Link>
                        </Menu.Item>
                    )}
                    {data?.role !== 'ADMIN' && (
                        <Menu.Item key="actions" icon={<HistoryOutlined />}>
                            <Link href="/admin/actions">
                                <a>Lịch sử hoạt động</a>
                            </Link>
                        </Menu.Item>
                    )}
                    {(data?.role !== 'ADMIN' || data?.permissions?.includes('customer')) && (
                        <Menu.Item key="customer" icon={<UserSwitchOutlined />}>
                            <Link href="/admin/customer">
                                <a>Quản lý khách hàng</a>
                            </Link>
                        </Menu.Item>
                    )}
                </Menu>
            </Sider>
        </Affix>
    );
};

export default SideBarAdmin;
