import { useState } from 'react';
import { Button, Tabs, Form, Input, InputNumber, Tag, Divider, Card, Rate } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import './RoomDetailManagement.css';

const RoomDetailManagement = ({ room, onBack, onSave, mode = 'view' }) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('details');

    // Mock survey data
    const surveyData = [
        {
            id: 1,
            studentName: 'Nguyễn Văn A',
            email: 'nguyenvana@email.com',
            phone: '0912345678',
            school: 'Đại học Bách Khoa Hà Nội',
            priceRange: '3m-4m',
            areaRange: '25-30',
            maxDistance: '1-2',
            amenities: ['wifi', 'ac', 'parking'],
            satisfaction: 4,
            feedback: 'Hệ thống rất hữu ích, giúp tôi tìm được phòng phù hợp.',
            submittedAt: '2025-12-01 10:30'
        },
        {
            id: 2,
            studentName: 'Trần Thị B',
            email: 'tranthib@email.com',
            phone: '0987654321',
            school: 'Đại học Quốc Gia Hà Nội',
            priceRange: '2m-3m',
            areaRange: '20-25',
            maxDistance: '2-3',
            amenities: ['wifi', 'security', 'laundry'],
            satisfaction: 5,
            feedback: 'Rất hài lòng với chất lượng phòng và giá cả.',
            submittedAt: '2025-12-02 14:20'
        }
    ];

    const handleSubmit = (values) => {
        onSave({ ...room, ...values });
    };

    const amenitiesMap = {
        wifi: 'Wi-Fi',
        ac: 'Điều hòa',
        parking: 'Chỗ để xe',
        security: 'Bảo vệ 24/7',
        laundry: 'Máy giặt',
        kitchen: 'Bếp riêng',
        furniture: 'Nội thất đầy đủ'
    };

    const priceRangeMap = {
        'under-2m': 'Dưới 2 triệu',
        '2m-3m': '2 - 3 triệu',
        '3m-4m': '3 - 4 triệu',
        '4m-5m': '4 - 5 triệu',
        'above-5m': 'Trên 5 triệu'
    };

    const areaRangeMap = {
        'under-20': 'Dưới 20 m²',
        '20-25': '20 - 25 m²',
        '25-30': '25 - 30 m²',
        '30-40': '30 - 40 m²',
        'above-40': 'Trên 40 m²'
    };

    const distanceMap = {
        'under-1': 'Dưới 1 km',
        '1-2': '1 - 2 km',
        '2-3': '2 - 3 km',
        '3-5': '3 - 5 km',
        'above-5': 'Trên 5 km'
    };

    const detailsTab = (
        <div className="detail-tab-content">
            <Form
                form={form}
                layout="vertical"
                initialValues={room}
                onFinish={handleSubmit}
            >
                <div className="form-row">
                    <Form.Item
                        label="Tên phòng"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                        className="form-item-half"
                    >
                        <Input
                            placeholder="VD: Phòng A101"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        className="form-item-half"
                    >
                        <select className="status-select" disabled={mode === 'view'}>
                            <option value="available">Còn trống</option>
                            <option value="rented">Đã thuê</option>
                        </select>
                    </Form.Item>
                </div>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                    <Input
                        placeholder="VD: 123 Đường ABC, Quận 1"
                        disabled={mode === 'view'}
                        size="large"
                    />
                </Form.Item>

                <div className="form-row">
                    <Form.Item
                        label="Giá thuê (VNĐ)"
                        name="price"
                        rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                        className="form-item-third"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="VD: 3000000"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Diện tích (m²)"
                        name="area"
                        rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                        className="form-item-third"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            placeholder="VD: 25"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Khoảng cách đến trường (km)"
                        name="distance"
                        rules={[{ required: true, message: 'Vui lòng nhập khoảng cách' }]}
                        className="form-item-third"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.1}
                            placeholder="VD: 1.5"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>
                </div>

                {mode === 'edit' && (
                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                        >
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                )}
            </Form>
        </div>
    );

    const surveyTab = (
        <div className="survey-tab-content">
            <div className="survey-stats">
                <Card className="stat-card">
                    <div className="stat-number">{surveyData.length}</div>
                    <div className="stat-label">Tổng khảo sát</div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-number">
                        {(surveyData.reduce((sum, s) => sum + s.satisfaction, 0) / surveyData.length).toFixed(1)}
                        <span className="stat-star">⭐</span>
                    </div>
                    <div className="stat-label">Đánh giá trung bình</div>
                </Card>
            </div>

            <div className="survey-list">
                {surveyData.map((survey) => (
                    <Card key={survey.id} className="survey-card">
                        <div className="survey-header">
                            <div className="survey-user">
                                <h3>{survey.studentName}</h3>
                                <p className="survey-meta">
                                    {survey.email} • {survey.phone}
                                </p>
                                <p className="survey-school">{survey.school}</p>
                            </div>
                            <div className="survey-time">{survey.submittedAt}</div>
                        </div>

                        <Divider />

                        <div className="survey-details">
                            <div className="survey-section">
                                <h4 className="section-title">Nhu cầu tìm phòng</h4>
                                <div className="survey-row">
                                    <div className="survey-field">
                                        <label>Khoảng giá:</label>
                                        <span>{priceRangeMap[survey.priceRange]}</span>
                                    </div>
                                    <div className="survey-field">
                                        <label>Diện tích:</label>
                                        <span>{areaRangeMap[survey.areaRange]}</span>
                                    </div>
                                    <div className="survey-field">
                                        <label>Khoảng cách:</label>
                                        <span>{distanceMap[survey.maxDistance]}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="survey-section">
                                <h4 className="section-title">Tiện ích mong muốn</h4>
                                <div className="amenities-tags">
                                    {survey.amenities.map(amenity => (
                                        <Tag key={amenity} color="green">
                                            {amenitiesMap[amenity]}
                                        </Tag>
                                    ))}
                                </div>
                            </div>

                            <div className="survey-section">
                                <h4 className="section-title">Đánh giá hệ thống</h4>
                                <div className="rating-display">
                                    <Rate disabled value={survey.satisfaction} />
                                    <span className="rating-text">
                                        ({survey.satisfaction}/5)
                                    </span>
                                </div>
                            </div>

                            {survey.feedback && (
                                <div className="survey-section">
                                    <h4 className="section-title">Góp ý</h4>
                                    <p className="feedback-text">{survey.feedback}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const tabItems = [
        {
            key: 'details',
            label: 'Chi tiết phòng',
            children: detailsTab
        },
        {
            key: 'survey',
            label: 'Form khảo sát',
            children: surveyTab
        }
    ];

    return (
        <div className="room-detail-management">
            <div className="detail-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    size="large"
                >
                    Quay lại
                </Button>
                <div className="detail-title">
                    <h1>{room.name}</h1>
                    <Tag color={room.status === 'available' ? 'green' : 'red'}>
                        {room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                    </Tag>
                </div>
            </div>

            <div className="detail-content">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </div>
        </div>
    );
};

export default RoomDetailManagement;
