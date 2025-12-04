import { useState, useEffect } from 'react';
import { Button, Tabs, Tag, Card, Divider, Row, Col, Image, Rate, message, List, Form, Input, InputNumber, Select } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, ExpandOutlined, DollarOutlined, HomeOutlined, SaveOutlined } from '@ant-design/icons';
import { getRoomDetailApi, getAllSurveyQuestionsApi, getAllAreaTypesApi } from '../util/api';
import { ROOM_TYPE, ROOM_TYPE_LABELS, ROOM_STATUS, ROOM_STATUS_LABELS } from '../util/constants';
import './RoomDetailManagement.css';

const { TextArea } = Input;
const { Option } = Select;

const RoomDetailManagement = ({ room, onBack, onSave, mode = 'view' }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [roomDetail, setRoomDetail] = useState(null);
    const [surveyQuestions, setSurveyQuestions] = useState([]);
    const [surveyAnswers, setSurveyAnswers] = useState([]);
    const [areaTypes, setAreaTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [surveyForm] = Form.useForm();

    const isEditMode = mode === 'edit' || mode === 'add';
    const isAddMode = mode === 'add';

    useEffect(() => {
        fetchAreaTypes();
        fetchSurveyData(); // Lấy câu hỏi khảo sát cho tất cả mode
        if (room?.id) {
            fetchRoomDetail();
        } else if (isAddMode) {
            // Chế độ thêm mới - sử dụng dữ liệu từ room prop
            setRoomDetail(room);
            form.setFieldsValue({
                title: room.title || '',
                description: room.description || '',
                address: room.address || '',
                latitude: room.latitude || 21.0285,
                longitude: room.longitude || 105.8542,
                priceVnd: room.priceVnd || 0,
                areaSqm: room.areaSqm || 0,
                roomType: room.roomType || 'SINGLE',
                status: room.status || 'AVAILABLE',
                areaTypeId: room.areaTypeId || 1
            });
            // Khởi tạo giá trị mặc định cho survey form
            initializeSurveyForm();
        }
    }, [room?.id, mode]);

    const fetchAreaTypes = async () => {
        try {
            // MOCK API
            const response = {
                code: '00',
                message: null,
                data: [
                    { id: 1, name: 'Gần trường' },
                    { id: 2, name: 'Trung tâm' },
                    { id: 3, name: 'Ngoại thành' }
                ]
            };
            await new Promise(resolve => setTimeout(resolve, 300));
            if (response.code === '00') {
                setAreaTypes(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
        }
    };

    const fetchRoomDetail = async () => {
        try {
            // MOCK API - Success case with detailed room info
            const mockRoomDetails = {
                1: {
                    id: 1,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    areaTypeName: 'Gần trường',
                    title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
                    description: 'Phòng rộng rãi, đầy đủ tiện nghi, an ninh 24/7. Gần trường học, siêu thị, bệnh viện. Chủ nhà thân thiện, hỗ trợ nhiệt tình.',
                    address: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
                    latitude: 21.0285,
                    longitude: 105.8542,
                    priceVnd: 3500000,
                    areaSqm: 25.5,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.8,
                    avgSecurity: 4.5,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
                    roomNotCoverImageUrls: [
                        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
                        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
                        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500'
                    ],
                    amenities: ['WiFi', 'Điều hòa', 'Máy giặt', 'Bếp', 'Chỗ đậu xe', 'An ninh 24/7'],
                    landlord: {
                        fullName: 'Nguyễn Văn A',
                        phoneNumber: '0912345678'
                    }
                }
            };

            const response = {
                code: '00',
                message: null,
                data: mockRoomDetails[room.id] || {
                    ...mockRoomDetails[1],
                    id: room.id,
                    title: room.title || 'Phòng chưa có tên'
                }
            };

            await new Promise(resolve => setTimeout(resolve, 400));

            if (response.code === '00' && response.data) {
                setRoomDetail(response.data);
                // Set form values cho chế độ edit
                if (isEditMode) {
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
            }
        } catch (error) {
            console.error('Error fetching room detail:', error);
            message.error('Không thể tải chi tiết phòng');
        }
    };

    const fetchSurveyData = async () => {
        try {
            // MOCK API - Get survey questions (2 loại: Tiện nghi và An ninh)
            const questionsResponse = {
                code: '00',
                message: null,
                data: [
                    // Tiện nghi
                    { id: 1, questionText: 'WiFi có ổn định không?', questionOrder: 1, category: 'amenity' },
                    { id: 2, questionText: 'Điều hòa có hoạt động tốt không?', questionOrder: 2, category: 'amenity' },
                    { id: 3, questionText: 'Nước nóng có đầy đủ không?', questionOrder: 3, category: 'amenity' },
                    { id: 4, questionText: 'Giường tủ có đầy đủ không?', questionOrder: 4, category: 'amenity' },
                    { id: 5, questionText: 'Khu vực nấu ăn có tiện lợi không?', questionOrder: 5, category: 'amenity' },
                    // An ninh
                    { id: 6, questionText: 'Có camera an ninh không?', questionOrder: 6, category: 'security' },
                    { id: 7, questionText: 'Có bảo vệ 24/7 không?', questionOrder: 7, category: 'security' },
                    { id: 8, questionText: 'Khu vực có an toàn không?', questionOrder: 8, category: 'security' },
                    { id: 9, questionText: 'Cửa ra vào có khóa chặt không?', questionOrder: 9, category: 'security' },
                    { id: 10, questionText: 'Có hệ thống báo cháy không?', questionOrder: 10, category: 'security' }
                ]
            };

            // MOCK API - Get survey answers for this room (chỉ khi có room.id)
            let answersResponse = { code: '00', message: null, data: [] };
            if (room?.id) {
                answersResponse = {
                    code: '00',
                    message: null,
                    data: [
                        // Tiện nghi
                        { surveyQuestionId: 1, avgPoint: 4.8, totalAnswers: 15 },
                        { surveyQuestionId: 2, avgPoint: 4.9, totalAnswers: 15 },
                        { surveyQuestionId: 3, avgPoint: 4.2, totalAnswers: 15 },
                        { surveyQuestionId: 4, avgPoint: 4.7, totalAnswers: 15 },
                        { surveyQuestionId: 5, avgPoint: 4.5, totalAnswers: 15 },
                        // An ninh
                        { surveyQuestionId: 6, avgPoint: 4.6, totalAnswers: 15 },
                        { surveyQuestionId: 7, avgPoint: 4.8, totalAnswers: 15 },
                        { surveyQuestionId: 8, avgPoint: 4.3, totalAnswers: 15 },
                        { surveyQuestionId: 9, avgPoint: 4.7, totalAnswers: 15 },
                        { surveyQuestionId: 10, avgPoint: 4.4, totalAnswers: 15 }
                    ]
                };
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            if (questionsResponse.code === '00') {
                setSurveyQuestions(questionsResponse.data);
            }
            if (answersResponse.code === '00') {
                setSurveyAnswers(answersResponse.data);
                // Set giá trị cho survey form khi edit
                if (mode === 'edit' && answersResponse.data.length > 0) {
                    const surveyValues = {};
                    answersResponse.data.forEach(answer => {
                        surveyValues[`question_${answer.surveyQuestionId}`] = answer.avgPoint;
                    });
                    surveyForm.setFieldsValue(surveyValues);
                }
            }
        } catch (error) {
            console.error('Error fetching survey data:', error);
        }
    };

    // Khởi tạo giá trị mặc định cho survey form (chế độ thêm mới)
    const initializeSurveyForm = () => {
        const defaultValues = {};
        // Set tất cả câu hỏi về 0 điểm
        for (let i = 1; i <= 10; i++) {
            defaultValues[`question_${i}`] = 0;
        }
        surveyForm.setFieldsValue(defaultValues);
    };

    // Calculate average score from survey answers
    const calculateAverageScore = () => {
        if (surveyAnswers.length === 0) return 0;
        const total = surveyAnswers.reduce((sum, answer) => sum + answer.avgPoint, 0);
        return (total / surveyAnswers.length).toFixed(1);
    };

    // Calculate average score by category
    const calculateCategoryAverage = (category) => {
        const categoryQuestions = surveyQuestions.filter(q => q.category === category);
        if (categoryQuestions.length === 0) return 0;

        const categoryAnswers = surveyAnswers.filter(a =>
            categoryQuestions.some(q => q.id === a.surveyQuestionId)
        );

        if (categoryAnswers.length === 0) return 0;
        const total = categoryAnswers.reduce((sum, answer) => sum + answer.avgPoint, 0);
        return (total / categoryAnswers.length).toFixed(1);
    };

    // Calculate average from form values (for edit/add mode)
    const calculateFormAverage = (category) => {
        const categoryQuestions = surveyQuestions.filter(q => q.category === category);
        if (categoryQuestions.length === 0) return 0;

        const values = surveyForm.getFieldsValue();
        let total = 0;
        let count = 0;

        categoryQuestions.forEach(q => {
            const value = values[`question_${q.id}`];
            if (value !== undefined && value !== null) {
                total += value;
                count++;
            }
        });

        return count > 0 ? (total / count).toFixed(1) : 0;
    };

    // Handle form submit
    const handleSubmit = async () => {
        try {
            // Validate cả 2 form
            await form.validateFields();
            const surveyValues = await surveyForm.validateFields();

            setLoading(true);

            // Chuyển đổi survey values thành format API
            const surveyAnswers = Object.keys(surveyValues).map(key => {
                const questionId = parseInt(key.replace('question_', ''));
                return {
                    surveyQuestionId: questionId,
                    point: surveyValues[key]
                };
            });

            const roomValues = form.getFieldsValue();
            const updatedRoom = {
                ...roomDetail,
                ...roomValues,
                surveyAnswers
            };

            if (onSave) {
                await onSave(updatedRoom);
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin!');
            } else {
                console.error('Error saving room:', error);
                message.error('Có lỗi xảy ra khi lưu phòng');
            }
        } finally {
            setLoading(false);
        }
    };

    // Mock map component (sẽ được BE xử lý sau)
    const MapPreview = ({ latitude, longitude }) => {
        return (
            <div className="map-preview">
                <div className="map-container">
                    <div className="map-placeholder">
                        <EnvironmentOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        <p>Bản đồ hiển thị vị trí phòng</p>
                        <p className="coordinates">
                            Lat: {latitude?.toFixed(6)}, Lng: {longitude?.toFixed(6)}
                        </p>
                        <p className="map-note">
                            <small>* Tích hợp Google Maps sẽ được cập nhật sau</small>
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    // Tab 1: Room Information
    const roomInfoTab = isEditMode ? (
        // Edit/Add Mode - Form with editable fields
        <Form
            form={form}
            layout="vertical"
            className="room-edit-form"
        >
            <Row gutter={[24, 24]} className="room-detail-content">
                {/* Left Column - Room Info Form */}
                <Col xs={24} lg={10}>
                    <Card className="room-info-section">
                        <h3 className="section-title">Thông tin cơ bản</h3>

                        <Form.Item
                            label="Tên phòng"
                            name="title"
                            rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                        >
                            <Input placeholder="VD: Phòng trọ cao cấp gần ĐH Bách Khoa" size="large" />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Mô tả chi tiết về phòng..."
                            />
                        </Form.Item>

                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input placeholder="VD: 123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội" size="large" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Vĩ độ (Latitude)"
                                    name="latitude"
                                    rules={[{ required: true, message: 'Vui lòng nhập vĩ độ' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        step={0.000001}
                                        placeholder="21.0285"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Kinh độ (Longitude)"
                                    name="longitude"
                                    rules={[{ required: true, message: 'Vui lòng nhập kinh độ' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        step={0.000001}
                                        placeholder="105.8542"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Giá thuê (VNĐ)"
                                    name="priceVnd"
                                    rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="3000000"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Diện tích (m²)"
                                    name="areaSqm"
                                    rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        step={0.1}
                                        placeholder="25"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Loại phòng"
                                    name="roomType"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
                                >
                                    <Select placeholder="Chọn loại phòng" size="large">
                                        <Option value={ROOM_TYPE.SINGLE}>{ROOM_TYPE_LABELS[ROOM_TYPE.SINGLE]}</Option>
                                        <Option value={ROOM_TYPE.SHARED}>{ROOM_TYPE_LABELS[ROOM_TYPE.SHARED]}</Option>
                                        <Option value={ROOM_TYPE.STUDIO}>{ROOM_TYPE_LABELS[ROOM_TYPE.STUDIO]}</Option>
                                        <Option value={ROOM_TYPE.APARTMENT}>{ROOM_TYPE_LABELS[ROOM_TYPE.APARTMENT]}</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Trạng thái"
                                    name="status"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                                >
                                    <Select placeholder="Chọn trạng thái" size="large">
                                        <Option value={ROOM_STATUS.AVAILABLE}>{ROOM_STATUS_LABELS[ROOM_STATUS.AVAILABLE]}</Option>
                                        <Option value={ROOM_STATUS.RENTED}>{ROOM_STATUS_LABELS[ROOM_STATUS.RENTED]}</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Khu vực"
                            name="areaTypeId"
                            rules={[{ required: true, message: 'Vui lòng chọn khu vực' }]}
                        >
                            <Select placeholder="Chọn khu vực" size="large">
                                {areaTypes.map(area => (
                                    <Option key={area.id} value={area.id}>{area.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Card>
                </Col>

                {/* Right Column - Map */}
                <Col xs={24} lg={14}>
                    <div className="map-section">
                        <Card title="Vị trí trên bản đồ" className="map-card">
                            <MapPreview
                                latitude={form.getFieldValue('latitude') || roomDetail?.latitude}
                                longitude={form.getFieldValue('longitude') || roomDetail?.longitude}
                            />
                            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 8 }}>
                                <p style={{ margin: 0, fontSize: 14, color: '#1890ff' }}>
                                    💡 <strong>Lưu ý:</strong> Chọn vị trí chính xác trên bản đồ để sinh viên dễ dàng tìm kiếm phòng của bạn.
                                    Tính năng chọn điểm trên bản đồ sẽ được cập nhật sau.
                                </p>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Form>
    ) : (
        // View Mode - Display only
        <Row gutter={[24, 24]} className="room-detail-content">
            {/* Left Column - Room Info */}
            <Col xs={24} lg={10}>
                <div className="room-info-section">
                    {/* Image Gallery */}
                    <div className="room-images">
                        <Image.PreviewGroup>
                            <div className="main-image">
                                <Image
                                    src={roomDetail?.roomCoverImageUrl || 'https://via.placeholder.com/600x400'}
                                    alt={roomDetail?.title}
                                    className="primary-image"
                                />
                            </div>
                            {roomDetail?.roomNotCoverImageUrls && roomDetail.roomNotCoverImageUrls.length > 0 && (
                                <div className="thumbnail-images">
                                    {roomDetail.roomNotCoverImageUrls.slice(0, 3).map((img, index) => (
                                        <Image
                                            key={index}
                                            src={img}
                                            alt={`${roomDetail.title} - ${index + 2}`}
                                            className="thumbnail-image"
                                        />
                                    ))}
                                </div>
                            )}
                        </Image.PreviewGroup>
                    </div>

                    {/* Title & Rating */}
                    <div className="room-header">
                        <h1 className="room-title">{roomDetail?.title}</h1>
                        <div className="room-rating">
                            <Rate disabled defaultValue={roomDetail?.avgAmenity || 0} allowHalf />
                            <span className="rating-text">
                                {roomDetail?.avgAmenity?.toFixed(1) || 0} (Tiện nghi)
                            </span>
                        </div>
                    </div>

                    {/* Price & Area */}
                    <div className="room-quick-info">
                        <div className="info-item price-item">
                            <DollarOutlined className="info-icon" />
                            <div>
                                <span className="price-amount">{roomDetail?.priceVnd?.toLocaleString()}đ</span>
                                <span className="price-period">/tháng</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <ExpandOutlined className="info-icon" />
                            <span className="info-text">{roomDetail?.areaSqm}m²</span>
                        </div>
                        <div className="info-item">
                            <HomeOutlined className="info-icon" />
                            <span className="info-text">{ROOM_TYPE_LABELS[roomDetail?.roomType] || roomDetail?.roomType}</span>
                        </div>
                    </div>

                    <Divider />

                    {/* Address */}
                    <div className="room-section">
                        <h3 className="section-title">Địa chỉ</h3>
                        <div className="address-info">
                            <EnvironmentOutlined className="location-icon" />
                            <span>{roomDetail?.address}</span>
                        </div>
                    </div>

                    <Divider />

                    {/* Description */}
                    <div className="room-section">
                        <h3 className="section-title">Mô tả</h3>
                        <p className="room-description">{roomDetail?.description || 'Chưa có mô tả'}</p>
                    </div>

                    <Divider />

                    {/* Amenities */}
                    <div className="room-section">
                        <h3 className="section-title">Tiện nghi</h3>
                        <div className="amenities-list">
                            {roomDetail?.amenities?.map((amenity, index) => (
                                <Tag key={index} className="amenity-tag-large" color="green">
                                    {amenity}
                                </Tag>
                            )) || <span className="text-muted">Chưa có thông tin tiện nghi</span>}
                        </div>
                    </div>

                    <Divider />

                    {/* Other Info */}
                    <div className="room-section">
                        <h3 className="section-title">Thông tin khác</h3>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="info-label">Loại khu vực:</span>
                                <span className="info-value">{roomDetail?.areaTypeName || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Điểm an ninh:</span>
                                <span className="info-value">
                                    <Rate disabled defaultValue={roomDetail?.avgSecurity || 0} allowHalf />
                                    {roomDetail?.avgSecurity?.toFixed(1) || 0}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Trạng thái:</span>
                                <Tag color={roomDetail?.status === 'AVAILABLE' ? 'green' : 'red'}>
                                    {ROOM_STATUS_LABELS[roomDetail?.status] || roomDetail?.status}
                                </Tag>
                            </div>
                            {roomDetail?.landlord && (
                                <>
                                    <div className="info-row">
                                        <span className="info-label">Chủ nhà:</span>
                                        <span className="info-value">{roomDetail.landlord.fullName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Số điện thoại:</span>
                                        <span className="info-value">{roomDetail.landlord.phoneNumber}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Col>

            {/* Right Column - Map */}
            <Col xs={24} lg={14}>
                <div className="map-section">
                    <Card title="Vị trí trên bản đồ" className="map-card">
                        <MapPreview
                            latitude={roomDetail?.latitude}
                            longitude={roomDetail?.longitude}
                        />
                    </Card>
                </div>
            </Col>
        </Row>
    );

    // Tab 2: Survey Answers & Average Score
    const surveyTab = (
        <div className="survey-tab-content">
            {/* Summary Stats */}
            <Row gutter={[16, 16]} className="survey-summary">
                <Col xs={24} sm={12}>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-number">{surveyAnswers.length}</div>
                            <div className="stat-label">Tổng câu hỏi khảo sát</div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="stat-card">
                        <div className="stat-content">
                            <div className="stat-number">
                                {calculateAverageScore()}
                                <Rate
                                    disabled
                                    defaultValue={parseFloat(calculateAverageScore())}
                                    allowHalf
                                    style={{ fontSize: 20, marginLeft: 8 }}
                                />
                            </div>
                            <div className="stat-label">Điểm trung bình</div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Survey Questions & Answers */}
            <Card title="Chi tiết kết quả khảo sát" className="survey-details-card">
                <List
                    dataSource={surveyQuestions}
                    renderItem={(question) => {
                        const answer = surveyAnswers.find(a => a.surveyQuestionId === question.id);
                        return (
                            <List.Item className="survey-item">
                                <div className="survey-question-wrapper">
                                    <div className="survey-question">
                                        <span className="question-number">#{question.questionOrder}</span>
                                        <span className="question-text">{question.questionText}</span>
                                    </div>
                                    <div className="survey-answer">
                                        <Rate
                                            disabled
                                            defaultValue={answer?.avgPoint || 0}
                                            allowHalf
                                        />
                                        <span className="answer-score">
                                            {answer?.avgPoint?.toFixed(1) || 0}/5.0
                                        </span>
                                        <span className="answer-count">
                                            ({answer?.totalAnswers || 0} đánh giá)
                                        </span>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Card>
        </div>
    );

    // Survey Form Tab for Edit/Add Mode
    const surveyFormTab = (
        <div className="survey-form-tab">
            <Form
                form={surveyForm}
                layout="vertical"
                className="survey-form"
            >
                <Row gutter={[24, 24]}>
                    {/* Tiện nghi Form */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <div className="survey-card-header">
                                    <span>Form Khảo Sát Tiện Nghi</span>
                                    <div className="survey-avg-display">
                                        <Rate
                                            disabled
                                            value={parseFloat(isEditMode ? calculateFormAverage('amenity') : calculateCategoryAverage('amenity'))}
                                            allowHalf
                                        />
                                        <span className="avg-score">
                                            {isEditMode ? calculateFormAverage('amenity') : calculateCategoryAverage('amenity')}/5.0
                                        </span>
                                    </div>
                                </div>
                            }
                            className="survey-form-card"
                        >
                            {surveyQuestions.filter(q => q.category === 'amenity').map((question, index) => (
                                <Form.Item
                                    key={question.id}
                                    label={`${index + 1}. ${question.questionText}`}
                                    name={`question_${question.id}`}
                                    rules={isEditMode ? [{ required: true, message: 'Vui lòng đánh giá câu hỏi này' }] : []}
                                >
                                    <Rate
                                        allowHalf
                                        disabled={!isEditMode}
                                        onChange={() => {
                                            if (isEditMode) {
                                                // Trigger re-render để cập nhật điểm trung bình
                                                surveyForm.validateFields([`question_${question.id}`]);
                                            }
                                        }}
                                    />
                                </Form.Item>
                            ))}
                        </Card>
                    </Col>

                    {/* An ninh Form */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <div className="survey-card-header">
                                    <span>Form Khảo Sát An Ninh</span>
                                    <div className="survey-avg-display">
                                        <Rate
                                            disabled
                                            value={parseFloat(isEditMode ? calculateFormAverage('security') : calculateCategoryAverage('security'))}
                                            allowHalf
                                        />
                                        <span className="avg-score">
                                            {isEditMode ? calculateFormAverage('security') : calculateCategoryAverage('security')}/5.0
                                        </span>
                                    </div>
                                </div>
                            }
                            className="survey-form-card"
                        >
                            {surveyQuestions.filter(q => q.category === 'security').map((question, index) => (
                                <Form.Item
                                    key={question.id}
                                    label={`${index + 1}. ${question.questionText}`}
                                    name={`question_${question.id}`}
                                    rules={isEditMode ? [{ required: true, message: 'Vui lòng đánh giá câu hỏi này' }] : []}
                                >
                                    <Rate
                                        allowHalf
                                        disabled={!isEditMode}
                                        onChange={() => {
                                            if (isEditMode) {
                                                // Trigger re-render để cập nhật điểm trung bình
                                                surveyForm.validateFields([`question_${question.id}`]);
                                            }
                                        }}
                                    />
                                </Form.Item>
                            ))}
                        </Card>
                    </Col>
                </Row>

                {isEditMode && (
                    <>
                        <Divider />

                        <div className="form-actions">
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                icon={<SaveOutlined />}
                                size="large"
                                loading={loading}
                            >
                                {isAddMode ? 'Tạo phòng mới' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </div>
    );

    const tabItems = [
        {
            key: 'info',
            label: 'Thông tin chi tiết',
            children: roomInfoTab
        },
        {
            key: 'survey-form',
            label: 'Form khảo sát',
            children: surveyFormTab
        }
    ];

    const getHeaderTitle = () => {
        if (isAddMode) return 'Thêm phòng mới';
        if (isEditMode) return `Chỉnh sửa: ${roomDetail?.title || ''}`;
        return roomDetail?.title || room?.title || room?.name || 'Chi tiết phòng';
    };

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
                    <h1>{getHeaderTitle()}</h1>
                    {!isAddMode && (
                        <Tag color={room?.status === ROOM_STATUS.AVAILABLE || room?.status === 'AVAILABLE' ? 'green' : 'red'}>
                            {ROOM_STATUS_LABELS[room?.status] || (room?.status === 'available' ? 'Còn trống' : 'Đã thuê')}
                        </Tag>
                    )}
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
