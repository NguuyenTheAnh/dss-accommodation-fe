import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { adminLoginApi } from '../util/api';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            message.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);

        try {
            const response = await adminLoginApi({ username, password });

            if (response.code === '00') {
                message.success('Đăng nhập thành công!');
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('adminUsername', username);
                navigate('/management/rooms');
            } else {
                message.error(response.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="background-pattern"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <HomeOutlined className="logo-icon" />
                            <h1 className="logo-text">DormFinder</h1>
                        </div>
                        <h2 className="login-title">Quản trị viên</h2>
                        <p className="login-subtitle">Đăng nhập để quản lý hệ thống</p>
                    </div>

                    <div className="login-form">
                        <div className="form-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <Input
                                size="large"
                                prefix={<UserOutlined className="input-icon" />}
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined className="input-icon" />}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={loading}
                            onClick={handleLogin}
                            className="login-button"
                        >
                            Đăng nhập
                        </Button>
                    </div>

                    <div className="login-footer">
                        <p className="footer-text">
                            Chưa có tài khoản? <a href="/register" className="footer-link">Đăng ký ngay</a>
                        </p>
                        <p className="footer-text">
                            Quay về <a href="/" className="footer-link">Trang chủ</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
