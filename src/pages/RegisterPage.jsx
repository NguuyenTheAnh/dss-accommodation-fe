import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { registerApi } from '../util/api';
import './RegisterPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!email || !password || !fullName) {
            message.warning('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            message.warning('Email không hợp lệ');
            return;
        }

        // Password confirmation
        if (password !== confirmPassword) {
            message.warning('Mật khẩu xác nhận không khớp');
            return;
        }

        // Password length check
        if (password.length < 6) {
            message.warning('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await registerApi({
                email,
                password,
                fullName,
                phoneNumber
            });

            if (response.status === '00') {
                message.success('Đăng ký thành công! Vui lòng đăng nhập');
                navigate('/login');
            } else {
                message.error(response.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            message.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleRegister();
        }
    };

    return (
        <div className="register-page">
            <div className="register-background">
                <div className="background-pattern"></div>
            </div>

            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <div className="register-logo">
                            <HomeOutlined className="logo-icon" />
                            <h1 className="logo-text">DormFinder</h1>
                        </div>
                        <h2 className="register-title">Đăng ký tài khoản</h2>
                        <p className="register-subtitle">Tạo tài khoản chủ trọ miễn phí</p>
                    </div>

                    <div className="register-form">
                        <div className="form-group">
                            <label className="form-label">
                                Email <span className="required">*</span>
                            </label>
                            <Input
                                size="large"
                                prefix={<MailOutlined className="input-icon" />}
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Họ và tên <span className="required">*</span>
                            </label>
                            <Input
                                size="large"
                                prefix={<UserOutlined className="input-icon" />}
                                placeholder="Nhập họ và tên đầy đủ"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <Input
                                size="large"
                                prefix={<PhoneOutlined className="input-icon" />}
                                placeholder="Nhập số điện thoại"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Mật khẩu <span className="required">*</span>
                            </label>
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined className="input-icon" />}
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Xác nhận mật khẩu <span className="required">*</span>
                            </label>
                            <Input.Password
                                size="large"
                                prefix={<LockOutlined className="input-icon" />}
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={loading}
                            onClick={handleRegister}
                            className="register-button"
                        >
                            Đăng ký
                        </Button>
                    </div>

                    <div className="register-footer">
                        <p className="footer-text">
                            Đã có tài khoản? <a href="/login" className="footer-link">Đăng nhập</a>
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

export default RegisterPage;
