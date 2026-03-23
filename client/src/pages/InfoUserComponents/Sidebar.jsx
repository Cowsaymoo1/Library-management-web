import React from 'react';
import { Menu, Modal, message } from 'antd';
import { UserOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { requestLogout } from '../../config/request';

const Sidebar = ({ setActiveComponent, activeComponent, titles }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn đăng xuất không?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await requestLogout();
                    navigate('/');
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                } catch (error) {
                    console.error('Failed to logout:', error);
                    message.error('Đăng xuất thất bại, vui lòng thử lại.');
                }
            },
        });
    };

    const items = [
        {
            key: 'info',
            icon: <UserOutlined />,
            label: titles?.info || 'Thông tin cá nhân',
            onClick: () => setActiveComponent('info'),
        },
        {
            key: 'history',
            icon: <HistoryOutlined />,
            label: titles?.history || 'Lịch sử mượn sách',
            onClick: () => setActiveComponent('history'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true, // Hiển thị màu đỏ để cảnh báo
        },
    ];

    return (
        <Menu
            className="h-full p-2"
            style={{ borderInlineEnd: 'none' }}
            selectedKeys={[activeComponent]}
            mode="inline"
            items={items}
        />
    );
};

export default Sidebar;
