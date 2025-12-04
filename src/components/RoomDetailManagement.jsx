import { useState, useEffect } from 'react';
import { Button, Tabs, Form, Input, InputNumber, Tag, Divider, Card, Rate, Select, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { getRoomDetailApi, updateRoomApi, getAllAreaTypesApi } from '../util/api';
import { ROOM_TYPE, ROOM_TYPE_LABELS, ROOM_STATUS, ROOM_STATUS_LABELS } from '../util/constants';
import './RoomDetailManagement.css';

const RoomDetailManagement = ({ room, onBack, onSave, mode = 'view' }) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('details');
    const [roomDetail, setRoomDetail] = useState(null);
    const [areaTypes, setAreaTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (room?.id) {
            fetchRoomDetail();
        }
        fetchAreaTypes();
    }, [room?.id]);

    const fetchRoomDetail = async () => {
        try {
            // MOCK API - Success case with detailed room info
            const mockRoomDetails = {
                1: {
                    id: 1,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Ph\u00f2ng tr\u1ecd cao c\u1ea5p g\u1ea7n \u0110H B\u00e1ch Khoa',
                    description: 'Ph\u00f2ng r\u1ed9ng r\u00e3i, \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi, an ninh 24/7',
                    address: '123 \u0110\u1ea1i C\u1ed3 Vi\u1ec7t, Hai B\u00e0 Tr\u01b0ng, H\u00e0 N\u1ed9i',
                    latitude: 21.0285,
                    longitude: 105.8542,
                    priceVnd: 3500000,
                    areaSqm: 25.5,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.8,
                    avgSecurity: 4.5,
                    roomCoverImageId: 1,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
                    roomNotCoverImageIds: [2, 3],
                    surveyAnswers: [
                        { id: 1, surveyQuestionId: 1, point: 5 },
                        { id: 2, surveyQuestionId: 2, point: 5 },
                        { id: 3, surveyQuestionId: 3, point: 4 }
                    ]
                }
            };

            const response = {
                code: '00',
                message: null,
                data: mockRoomDetails[room.id] || {
                    id: room.id,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: room.title || 'Ph\u00f2ng ch\u01b0a c\u00f3 t\u00ean',
                    description: room.description || '',
                    address: room.address || '',
                    latitude: room.latitude || 21.0285,
                    longitude: room.longitude || 105.8542,
                    priceVnd: room.priceVnd || 0,
                    areaSqm: room.areaSqm || 0,
                    roomType: room.roomType || 'SINGLE',
                    status: room.status || 'AVAILABLE',
                    avgAmenity: room.avgAmenity || 0,
                    avgSecurity: room.avgSecurity || 0,
                    roomCoverImageId: room.roomCoverImageId || null,
                    roomCoverImageUrl: room.roomCoverImageUrl || null,
                    roomNotCoverImageIds: [],
                    surveyAnswers: []
                }
            };

            await new Promise(resolve => setTimeout(resolve, 400));

            if (response.code === '00' && response.data) {
                setRoomDetail(response.data);
                // Map API fields to form
                form.setFieldsValue({
                    title: response.data.title,
                    description: response.data.description,
                    address: response.data.address,
                    latitude: response.data.latitude,
                    longitude: response.data.longitude,
                    priceVnd: response.data.priceVnd,
                    areaSqm: response.data.areaSqm,
                    roomType: response.data.roomType,
                    status: response.data.status,
                    areaTypeId: response.data.areaTypeId
                });
            }
        } catch (error) {
            console.error('Error fetching room detail:', error);
            message.error('Không thể tải chi tiết phòng');
        }
    };

    const fetchAreaTypes = async () => {
        try {
            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: [
                    { id: 1, name: 'G\u1ea7n tr\u01b0\u1eddng' },
                    { id: 2, name: 'Trung t\u00e2m' },
                    { id: 3, name: 'Ngo\u1ea1i th\u00e0nh' }
                ]
            };

            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.code === '00' && response.data) {
                setAreaTypes(response.data);
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
        }
    };

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

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const updateData = {
                id: room.id,
                landlordUserId: roomDetail?.landlordUserId || 1,
                title: values.title,
                description: values.description,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                priceVnd: values.priceVnd,
                areaSqm: values.areaSqm,
                roomType: values.roomType,
                status: values.status,
                areaTypeId: values.areaTypeId,
                surveyAnswers: roomDetail?.surveyAnswers || [],
                roomCoverImageId: roomDetail?.roomCoverImageId || null,
                roomNotCoverImageIds: roomDetail?.roomNotCoverImageIds || []
            };

            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: updateData
            };

            await new Promise(resolve => setTimeout(resolve, 600));

            if (response.code === '00') {
                message.success('Cập nhật phòng thành công');
                if (onSave) {
                    onSave(response.data);
                }
            } else {
                message.error(response.message || 'Cập nhật phòng thất bại');
            }
        } catch (error) {
            console.error('Error updating room:', error);
            message.error('Có lỗi xảy ra khi cập nhật phòng');
        } finally {
            setLoading(false);
        }
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
                        name="title"
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
                        <Select
                            placeholder="Chọn trạng thái"
                            disabled={mode === 'view'}
                            size="large"
                        >
                            <Select.Option value={ROOM_STATUS.AVAILABLE}>{ROOM_STATUS_LABELS[ROOM_STATUS.AVAILABLE]}</Select.Option>
                            <Select.Option value={ROOM_STATUS.RENTED}>{ROOM_STATUS_LABELS[ROOM_STATUS.RENTED]}</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    label="Mô tả"
                    name="description"
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Mô tả chi tiết về phòng..."
                        disabled={mode === 'view'}
                    />
                </Form.Item>

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
                        label="Vĩ độ (Latitude)"
                        name="latitude"
                        rules={[{ required: true, message: 'Vui lòng nhập vĩ độ' }]}
                        className="form-item-half"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            step={0.000001}
                            placeholder="VD: 21.0285"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Kinh độ (Longitude)"
                        name="longitude"
                        rules={[{ required: true, message: 'Vui lòng nhập kinh độ' }]}
                        className="form-item-half"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            step={0.000001}
                            placeholder="VD: 105.8542"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        label="Giá thuê (VNĐ)"
                        name="priceVnd"
                        rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                        className="form-item-half"
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
                        name="areaSqm"
                        rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                        className="form-item-half"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.1}
                            placeholder="VD: 25"
                            disabled={mode === 'view'}
                            size="large"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        label="Loại phòng"
                        name="roomType"
                        rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
                        className="form-item-half"
                    >
                        <Select
                            placeholder="Chọn loại phòng"
                            disabled={mode === 'view'}
                            size="large"
                        >
                            <Select.Option value={ROOM_TYPE.SINGLE}>{ROOM_TYPE_LABELS[ROOM_TYPE.SINGLE]}</Select.Option>
                            <Select.Option value={ROOM_TYPE.SHARED}>{ROOM_TYPE_LABELS[ROOM_TYPE.SHARED]}</Select.Option>
                            <Select.Option value={ROOM_TYPE.STUDIO}>{ROOM_TYPE_LABELS[ROOM_TYPE.STUDIO]}</Select.Option>
                            <Select.Option value={ROOM_TYPE.APARTMENT}>{ROOM_TYPE_LABELS[ROOM_TYPE.APARTMENT]}</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Khu vực"
                        name="areaTypeId"
                        rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
                        className="form-item-half"
                    >
                        <Select
                            placeholder="Chọn khu vực"
                            disabled={mode === 'view'}
                            size="large"
                        >
                            {areaTypes.map(area => (
                                <Select.Option key={area.id} value={area.id}>{area.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                {mode === 'edit' && (
                    <Form.Item className="form-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            loading={loading}
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
                    <h1>{roomDetail?.title || room?.title || room?.name}</h1>
                    <Tag color={room.status === ROOM_STATUS.AVAILABLE ? 'green' : 'red'}>
                        {ROOM_STATUS_LABELS[room.status] || (room.status === 'available' ? 'Còn trống' : 'Đã thuê')}
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
