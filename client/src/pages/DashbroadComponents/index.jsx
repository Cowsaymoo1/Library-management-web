import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, SolutionOutlined, IdcardOutlined, BookOutlined, LineChartOutlined } from '@ant-design/icons';

import UserManagement from './UserManagement';
import LoanRequestManagement from './LoanRequestManagement';
import CardIssuanceManagement from './CardIssuanceManagement';
import BookManagement from './BookManagement';
import Statistics from './Statistics';

const { Header, Content, Sider, Footer } = Layout;

const components = {
    stats: <Statistics />,
    user: <UserManagement />,
    loan: <LoanRequestManagement />,
    card: <CardIssuanceManagement />,
    book: <BookManagement />,
};

const menuItems = [
    {
        key: 'stats',
        icon: <LineChartOutlined />,
        label: 'Thống kê',
    },
    {
        key: 'book',
        icon: <BookOutlined />,
        label: 'Quản lý sách',
    },
    {
        key: 'loan',
        icon: <SolutionOutlined />,
        label: 'Quản lý mượn sách',
    },
    {
        key: 'card',
        icon: <IdcardOutlined />,
        label: 'Quản lý cấp thẻ',
    },
    {
        key: 'user',
        icon: <UserOutlined />,
        label: 'Quản lý người dùng',
    },
];

const IndexDashBroad = () => {
    const [selectedKey, setSelectedKey] = useState('stats');

    const renderContent = () => {
        return components[selectedKey] || <div>Chọn một mục từ menu</div>;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <div className="mx-4 my-4 flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2">
                    <img
                        src="/thiet-ke-logo-thu-vien-thiet-ke-phang_23-2149324476.avif"
                        alt="Library logo"
                        className="h-8 w-8 rounded-md bg-white p-1 object-contain"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-5 text-white">Thư viện số</p>
                        <p className="truncate text-xs leading-4 text-gray-300">Admin Dashboard</p>
                    </div>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['stats']}
                    items={menuItems}
                    onClick={(e) => setSelectedKey(e.key)}
                />
            </Sider>
            <Layout>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div className="p-6 bg-white" style={{ minHeight: 360 }}>
                        {renderContent()}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Hệ thống Quản lý Thư viện ©2026</Footer>
            </Layout>
        </Layout>
    );
};

export default IndexDashBroad;
