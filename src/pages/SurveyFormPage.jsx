import { useState } from 'react';
import { Form, Input, Select, Rate, Button, message, Card } from 'antd';
import { SmileOutlined, MehOutlined, FrownOutlined } from '@ant-design/icons';
import './SurveyFormPage.css';

const { TextArea } = Input;
const { Option } = Select;

const SurveyFormPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // await submitSurveyApi(values);
            console.log('Survey data:', values);

            setTimeout(() => {
                message.success('Gửi khảo sát thành công!');
                form.resetFields();
                setLoading(false);
            }, 1000);
        } catch (error) {
            message.error('Có lỗi xảy ra khi gửi khảo sát');
            setLoading(false);
        }
    };

    const customIcons = {
        1: <FrownOutlined />,
        2: <FrownOutlined />,
        3: <MehOutlined />,
        4: <SmileOutlined />,
        5: <SmileOutlined />,
    };

    return (
        <div className="survey-form-page">
            <div className="page-header">
                <h1 className="page-title">Form khảo sát sinh viên</h1>
                <p className="page-description">
                    Thu thập phản hồi từ sinh viên về nhu cầu tìm phòng trọ
                </p>
            </div>

            <Card className="survey-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    {/* Personal Info */}
                    <div className="form-section">
                        <h3 className="section-title">Thông tin cá nhân</h3>

                        <Form.Item
                            label="Họ và tên"
                            name="fullName"
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                        >
                            <Input placeholder="VD: Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email' },
                                { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                        >
                            <Input placeholder="VD: example@email.com" />
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input placeholder="VD: 0912345678" />
                        </Form.Item>

                        <Form.Item
                            label="Trường đang học"
                            name="school"
                            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
                        >
                            <Input placeholder="VD: Đại học Bách Khoa Hà Nội" />
                        </Form.Item>
                    </div>

                    {/* Room Preferences */}
                    <div className="form-section">
                        <h3 className="section-title">Nhu cầu tìm phòng</h3>

                        <Form.Item
                            label="Khoảng giá mong muốn (VNĐ/tháng)"
                            name="priceRange"
                            rules={[{ required: true, message: 'Vui lòng chọn khoảng giá' }]}
                        >
                            <Select placeholder="Chọn khoảng giá">
                                <Option value="under-2m">Dưới 2 triệu</Option>
                                <Option value="2m-3m">2 - 3 triệu</Option>
                                <Option value="3m-4m">3 - 4 triệu</Option>
                                <Option value="4m-5m">4 - 5 triệu</Option>
                                <Option value="above-5m">Trên 5 triệu</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Diện tích mong muốn (m²)"
                            name="areaRange"
                            rules={[{ required: true, message: 'Vui lòng chọn diện tích' }]}
                        >
                            <Select placeholder="Chọn diện tích">
                                <Option value="under-20">Dưới 20 m²</Option>
                                <Option value="20-25">20 - 25 m²</Option>
                                <Option value="25-30">25 - 30 m²</Option>
                                <Option value="30-40">30 - 40 m²</Option>
                                <Option value="above-40">Trên 40 m²</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Khoảng cách tối đa đến trường (km)"
                            name="maxDistance"
                            rules={[{ required: true, message: 'Vui lòng chọn khoảng cách' }]}
                        >
                            <Select placeholder="Chọn khoảng cách">
                                <Option value="under-1">Dưới 1 km</Option>
                                <Option value="1-2">1 - 2 km</Option>
                                <Option value="2-3">2 - 3 km</Option>
                                <Option value="3-5">3 - 5 km</Option>
                                <Option value="above-5">Trên 5 km</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Tiện ích quan trọng"
                            name="amenities"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 tiện ích' }]}
                        >
                            <Select mode="multiple" placeholder="Chọn tiện ích">
                                <Option value="wifi">Wi-Fi</Option>
                                <Option value="ac">Điều hòa</Option>
                                <Option value="parking">Chỗ để xe</Option>
                                <Option value="security">Bảo vệ 24/7</Option>
                                <Option value="laundry">Máy giặt</Option>
                                <Option value="kitchen">Bếp riêng</Option>
                                <Option value="furniture">Nội thất đầy đủ</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Satisfaction */}
                    <div className="form-section">
                        <h3 className="section-title">Đánh giá</h3>

                        <Form.Item
                            label="Mức độ hài lòng về hệ thống DormFinder"
                            name="satisfaction"
                            rules={[{ required: true, message: 'Vui lòng đánh giá' }]}
                        >
                            <Rate character={({ index }) => customIcons[index + 1]} />
                        </Form.Item>

                        <Form.Item
                            label="Góp ý / Đề xuất"
                            name="feedback"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Chia sẻ ý kiến của bạn về hệ thống..."
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                        >
                            Gửi khảo sát
                        </Button>
                        <Button
                            onClick={() => form.resetFields()}
                            size="large"
                        >
                            Làm mới
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SurveyFormPage;
