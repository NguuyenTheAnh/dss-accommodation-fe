import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import {
    HomeOutlined,
    FormOutlined,
    LogoutOutlined,
    MenuOutlined,
    CloseOutlined
} from '@ant-design/icons';
import './ManagementSidebar.css';

const ManagementSidebar = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn đăng xuất?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: {
                danger: true
            },
            onOk: () => {
                localStorage.removeItem('isAdminLoggedIn');
                localStorage.removeItem('adminUsername');
                navigate('/management/login');
            }
        });
    };

    const menuItems = [
        {
            key: 'rooms',
            path: '/management/rooms',
            icon: <HomeOutlined />,
            label: 'Quản lý phòng'
        },
        {
            key: 'surveys',
            path: '/management/surveys',
            icon: <FormOutlined />,
            label: 'Câu hỏi khảo sát'
        }
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>

            {/* Sidebar */}
            <div className={`management-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <HomeOutlined className="logo-icon" />
                    <h1 className="logo-text">DormFinder</h1>
                    <p className="logo-subtitle">Quản trị</p>
                </div>

                {/* Menu */}
                <nav className="sidebar-menu">
                    {menuItems.map(item => (
                        <NavLink
                            key={item.key}
                            to={item.path}
                            className={({ isActive }) =>
                                `menu-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        <LogoutOutlined className="logout-icon" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default ManagementSidebar;
