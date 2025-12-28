import { useState, useEffect } from 'react';

import { Button, Tabs, Tag, Card, Divider, Row, Col, Image, Rate, message, List, Form, Input, InputNumber, Select, Upload } from 'antd';

import { ArrowLeftOutlined, EnvironmentOutlined, ExpandOutlined, DollarOutlined, HomeOutlined, SaveOutlined, UploadOutlined, DeleteFilled, PhoneOutlined, AimOutlined } from '@ant-design/icons';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { getAllSurveyQuestionsApi, getAllAreaTypesApi, uploadFilesApi, getAllSurveysApi, getSurveyAnswersByRoomIdApi } from '../util/api';

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

    const [coverImage, setCoverImage] = useState(null); // {id, url}

    const [otherImages, setOtherImages] = useState([]); // [{id, url}]

    const [uploadingCover, setUploadingCover] = useState(false);

    const [uploadingOthers, setUploadingOthers] = useState(false);

    const [selectingOnMap, setSelectingOnMap] = useState(false);



    const isEditMode = mode === 'edit' || mode === 'add';

    const isAddMode = mode === 'add';



    const getStoredAdminId = () => {

        try {

            const raw = localStorage.getItem('adminUser');

            if (raw) {

                const parsed = JSON.parse(raw);

                if (parsed?.id) return parsed.id;

            }

            const fallbackId = localStorage.getItem('adminUserId');

            return fallbackId ? Number(fallbackId) : null;

        } catch (error) {

            console.error('Error reading admin id from storage:', error);

            return null;

        }

    };



    const buildImageUrl = (url) => {

        if (!url) return '';

        const raw = typeof url === 'string' ? url : url?.url || '';

        if (!raw) return '';

        if (raw.startsWith('http')) return raw;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

        return `${backendUrl}${raw}`;

    };

    const extractOtherImageUrls = (detail) => {
        if (!detail) return [];
        const urls = [];

        if (Array.isArray(detail.roomNotCoverImageUrls)) {
            urls.push(...detail.roomNotCoverImageUrls.filter(Boolean));
        }

        if (Array.isArray(detail.roomNotCoverImages)) {
            detail.roomNotCoverImages.forEach((img) => {
                if (!img) return;
                const candidate =
                    typeof img === 'string'
                        ? img
                        : img.roomNotCoverImageUrl || img.url || img.roomImageUrl || '';
                if (candidate) {
                    urls.push(candidate);
                }
            });
        }

        return urls;
    };

    const extractOtherImageObjects = (detail) => {
        if (!detail) return [];
        const images = [];

        if (Array.isArray(detail.roomNotCoverImages)) {
            detail.roomNotCoverImages.forEach((img, index) => {
                const url =
                    typeof img === 'string'
                        ? img
                        : img.roomNotCoverImageUrl || img.url || img.roomImageUrl || '';
                const id =
                    typeof img === 'string'
                        ? undefined
                        : img.roomNotCoverImageId || img.id;
                if (url) {
                    images.push({
                        id: id ?? `other-${index}`,
                        url: buildImageUrl(url)
                    });
                }
            });
        }

        if (Array.isArray(detail.roomNotCoverImageUrls)) {
            detail.roomNotCoverImageUrls.forEach((url, index) => {
                if (url) {
                    images.push({
                        id: `url-${index}`,
                        url: buildImageUrl(url)
                    });
                }
            });
        }

        return images;
    };



    useEffect(() => {

        fetchAreaTypes();

        fetchSurveyData();

        if (room) {

            setRoomDetail(room);

            setSurveyAnswers(room.surveyAnswers || []);
            fetchRoomSurveyAnswers(room.id);

            const coverUrl = room.roomCoverImageUrl || room.roomCoverImage?.url;
            setCoverImage(
                coverUrl
                    ? {
                        id: room.roomCoverImageId || room.roomCoverImage?.id,
                        url: buildImageUrl(coverUrl)
                    }
                    : null
            );
            setOtherImages(extractOtherImageObjects(room));

            if (isAddMode || isEditMode) {

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

                initializeSurveyForm();

            }

        }

    }, [room?.id, mode]);



    const fetchAreaTypes = async () => {

        try {

            const response = await getAllAreaTypesApi();

            if (response.code === '00') {

                setAreaTypes(response.data || []);

            }

        } catch (error) {

            console.error('Error fetching area types:', error);

        }

    };





    const fetchSurveyData = async () => {

        try {

            // Lấy danh sách tất cả surveys để biết ID của AMENITY và SECURITY

            const surveysResponse = await getAllSurveysApi();



            if (surveysResponse.code !== '00' || !surveysResponse.data) {

                message.error('Không thể tải danh sách khảo sát');

                return;

            }



            const surveys = surveysResponse.data;

            const amenitySurvey = surveys.find(s => s.type === 'AMENITY');

            const securitySurvey = surveys.find(s => s.type === 'SECURITY');



            // Lấy câu hỏi từ cả 2 surveys

            const allQuestions = [];



            if (amenitySurvey) {

                const amenityQuestionsResponse = await getAllSurveyQuestionsApi(amenitySurvey.id);

                if (amenityQuestionsResponse.code === '00' && amenityQuestionsResponse.data) {

                    const amenityQuestions = amenityQuestionsResponse.data.map(q => ({

                        ...q,

                        category: 'amenity'

                    }));

                    allQuestions.push(...amenityQuestions);

                }

            }



            if (securitySurvey) {

                const securityQuestionsResponse = await getAllSurveyQuestionsApi(securitySurvey.id);

                if (securityQuestionsResponse.code === '00' && securityQuestionsResponse.data) {

                    const securityQuestions = securityQuestionsResponse.data.map(q => ({

                        ...q,

                        category: 'security'

                    }));

                    allQuestions.push(...securityQuestions);

                }

            }



            setSurveyQuestions(allQuestions);



            // Nếu đang edit và có room.id, set giá trị từ surveyAnswers của room

            if ((mode === 'edit' || mode === 'view') && roomDetail?.surveyAnswers?.length > 0) {

                const surveyValues = {};

                roomDetail.surveyAnswers.forEach(answer => {

                    surveyValues[`question_${answer.surveyQuestionId}`] = answer.point;

                });

                surveyForm.setFieldsValue(surveyValues);

            }

        } catch (error) {

            console.error('Error fetching survey data:', error);

            message.error('Có lỗi xảy ra khi tải dữ liệu khảo sát');

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



    // Handle image upload

    const handleUploadCoverImage = async (file) => {
        try {
            setUploadingCover(true);
            const formData = new FormData();
            formData.append('files', file);

            const response = await uploadFilesApi(formData);

            if (response.code === '00' && response.data && response.data.length > 0) {
                const uploadedFile = response.data[0];
                const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
                setCoverImage({
                    id: uploadedFile.id,
                    url: `${backendUrl}${uploadedFile.url}`
                });
                message.success('Upload ảnh bìa thành công');
            } else {
                message.error('Upload ảnh bìa thất bại');
            }
        } catch (error) {
            console.error('Error uploading cover image:', error);
            message.error('Có lỗi xảy ra khi upload ảnh bìa');
        } finally {
            setUploadingCover(false);
        }
        return false; // Prevent auto upload
    };


    const handleUploadOtherImages = async (file, fileList) => {
        // Chỉ xử lý khi là file cuối cùng trong danh sách để tránh gọi nhiều lần
        const isLastFile = fileList[fileList.length - 1] === file;
        if (!isLastFile) {
            return false;
        }

        try {
            setUploadingOthers(true);
            const formData = new FormData();

            // Upload tất cả files được chọn
            fileList.forEach(f => {
                formData.append('files', f);
            });

            const response = await uploadFilesApi(formData);

            if (response.code === '00' && response.data && response.data.length > 0) {
                // Thêm tất cả ảnh đã upload vào danh sách
                const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
                const newImages = response.data.map(uploadedFile => ({
                    id: uploadedFile.id,
                    url: `${backendUrl}${uploadedFile.url}`
                }));
                setOtherImages(prev => [...prev, ...newImages]);
                message.success(`Upload thành công ${response.data.length} ảnh`);
            } else {
                message.error('Upload ảnh thất bại');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            message.error('Có lỗi xảy ra khi upload ảnh');
        } finally {
            setUploadingOthers(false);
        }
        return false; // Prevent auto upload
    };



    const handleRemoveCoverImage = () => {

        setCoverImage(null);

    };



    const handleRemoveOtherImage = (imageId) => {

        setOtherImages(prev => prev.filter(img => img.id !== imageId));

    };



    // Handle form submit

    const handleSubmit = async () => {

        try {

            // Validate cả 2 form

            await form.validateFields();

            const surveyValues = await surveyForm.validateFields();



            setLoading(true);



            // Chuyển đổi survey values thành format API

            const surveyAnswers = Object.keys(surveyValues)

                .map(key => {

                    const questionId = parseInt(key.replace('question_', ''));

                    return {

                        surveyQuestionId: questionId,

                        point: surveyValues[key]

                    };

                })

                .filter(answer => answer.point != null && answer.point !== 0); // Chỉ gửi những câu đã trả lời



            const roomValues = form.getFieldsValue();



            // Tạo object theo đúng format BE yêu cầu

            const updatedRoom = {

                landlordUserId: roomDetail?.landlordUserId || getStoredAdminId() || 1,

                title: roomValues.title,

                description: roomValues.description || '',

                address: roomValues.address,

                latitude: roomValues.latitude,

                longitude: roomValues.longitude,

                priceVnd: roomValues.priceVnd,

                areaSqm: roomValues.areaSqm,

                roomType: roomValues.roomType,

                status: roomValues.status,

                areaTypeId: roomValues.areaTypeId,

                surveyAnswers: surveyAnswers,

                roomCoverImageId: coverImage?.id || null,

                roomNotCoverImageIds: otherImages.map(img => img.id)

            };



            // Nếu đang edit, thêm id

            if (roomDetail?.id) {

                updatedRoom.id = roomDetail.id;

            }



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

    // Leaflet default marker assets

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({

        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',

        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',

        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'

    });



    const MapPreview = ({ latitude, longitude, title, address, selecting = false, onLocationSelect }) => {

        const lat = Number(latitude) || 0;

        const lng = Number(longitude) || 0;

        const center = [lat, lng];

        const ClickSelector = () => {

            useMapEvents({

                click: (e) => {

                    if (selecting && onLocationSelect) {

                        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });

                    }

                }

            });

            return null;

        };

        return (

            <div className="map-preview">

                <div className="map-container">

                    <MapContainer

                        key={`${lat}-${lng}-${selecting}`}

                        center={center}

                        zoom={15}

                        style={{ height: '100%', width: '100%' }}

                        scrollWheelZoom={false}

                    >

                        <TileLayer

                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'

                        />

                        <Marker position={center}>

                            <Popup>

                                <strong>{title}</strong>

                                <br />

                                {address}

                            </Popup>

                        </Marker>

                        <ClickSelector />

                    </MapContainer>

                </div>

                <div className="map-note">
                    <p style={{ margin: 0, fontSize: 14 }}>
                        Tọa độ hiện tại: <strong>{lat.toFixed(6)}</strong>, <strong>{lng.toFixed(6)}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#5f6b7a' }}>
                        (Kinh độ và vĩ độ dùng để định vị chính xác phòng trọ trên bản đồ. Hãy kiểm tra kỹ trước khi lưu.
                        {selecting ? ' Đang chọn vị trí, hãy click trên bản đồ.' : ''}
                        )
                    </p>
                </div>

            </div>

        );

    };

    const fetchRoomSurveyAnswers = async (roomId) => {
        if (!roomId) return;
        try {
            const res = await getSurveyAnswersByRoomIdApi(roomId);
            if (res.code !== '00' || !res.data?.surveyAnswers) {
                return;
            }
            const normalizedAnswers = res.data.surveyAnswers.map((ans) => ({
                ...ans,
                avgPoint: ans.avgPoint ?? ans.point ?? 0,
            }));
            setSurveyAnswers(normalizedAnswers);

            // hydrate survey form values if available
            const values = {};
            normalizedAnswers.forEach((ans) => {
                if (ans.surveyQuestionId) {
                    values[`question_${ans.surveyQuestionId}`] = ans.point ?? ans.avgPoint ?? 0;
                }
            });
            surveyForm.setFieldsValue(values);
        } catch (error) {
            console.error('Error fetching room survey answers:', error);
        }
    };



    const otherImageUrls = extractOtherImageUrls(roomDetail);



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



                        <Divider />



                        <h3 className="section-title">Ảnh phòng</h3>



                        <Form.Item label="Ảnh bìa">

                            {coverImage ? (

                                <div style={{ position: 'relative', display: 'inline-block' }}>

                                    <img

                                        src={coverImage.url}

                                        alt="Cover"

                                        style={{ width: '100%', maxWidth: 400, height: 250, objectFit: 'cover', borderRadius: 8 }}

                                    />

                                    <Button

                                        type="primary"

                                        danger

                                        size="small"

                                        icon={<DeleteFilled />}

                                        onClick={handleRemoveCoverImage}

                                        style={{ position: 'absolute', top: 8, right: 8 }}

                                    />

                                </div>

                            ) : (

                                <Upload

                                    beforeUpload={handleUploadCoverImage}

                                    showUploadList={false}

                                    accept="image/*"

                                >

                                    <Button icon={<UploadOutlined />} loading={uploadingCover} size="large" block>
                                        {uploadingCover ? 'Đang tải lên...' : 'Chọn ảnh bìa'}
                                    </Button>

                                </Upload>

                            )}

                            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                                Ảnh bìa sẽ hiển thị làm ảnh đại diện của phòng
                            </div>

                        </Form.Item>



                        <Form.Item label="Ảnh khác">

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>

                                {otherImages.map((img) => (

                                    <div key={img.id} style={{ position: 'relative', display: 'inline-block' }}>

                                        <img

                                            src={img.url}

                                            alt="Other"

                                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}

                                        />

                                        <Button

                                            type="primary"

                                            danger

                                            size="small"

                                            icon={<DeleteFilled />}

                                            onClick={() => handleRemoveOtherImage(img.id)}

                                            style={{ position: 'absolute', top: 4, right: 4 }}

                                        />

                                    </div>

                                ))}

                                <Upload

                                    beforeUpload={handleUploadOtherImages}

                                    showUploadList={false}

                                    accept="image/*"

                                    multiple

                                >

                                    <Button

                                        icon={<UploadOutlined />}

                                        loading={uploadingOthers}

                                        style={{ width: 120, height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}

                                    >

                                        <span>{uploadingOthers ? 'Đang tải...' : '+'}</span>

                                    </Button>

                                </Upload>

                            </div>

                            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                                Có thể upload nhiều ảnh để hiển thị chi tiết phòng
                            </div>

                        </Form.Item>

                    </Card>

                </Col>



                {/* Right Column - Map */}

                <Col xs={24} lg={14}>

                    <div className="map-section">

                        <Card

                            title="Vị trí trên bản đồ"

                            className="map-card"

                            extra={

                                isEditMode && (

                                    <Button

                                        icon={<AimOutlined />}

                                        size="small"

                                        onClick={() => setSelectingOnMap(true)}

                                    >

                                        Chọn trên map

                                    </Button>

                                )

                            }

                        >

                            <MapPreview

                                latitude={form.getFieldValue('latitude') || roomDetail?.latitude}

                                longitude={form.getFieldValue('longitude') || roomDetail?.longitude}

                                title={form.getFieldValue('title') || roomDetail?.title}

                                address={form.getFieldValue('address') || roomDetail?.address}

                                selecting={selectingOnMap}

                                onLocationSelect={({ lat, lng }) => {

                                    setSelectingOnMap(false);

                                    const fixedLat = Number(lat.toFixed(6));

                                    const fixedLng = Number(lng.toFixed(6));

                                    form.setFieldsValue({ latitude: fixedLat, longitude: fixedLng });

                                    setRoomDetail((prev) => ({ ...(prev || {}), latitude: fixedLat, longitude: fixedLng }));

                                    message.success('Đã chọn vị trí trên bản đồ');

                                }}

                            />

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

                                    src={buildImageUrl(roomDetail?.roomCoverImageUrl) || 'https://via.placeholder.com/600x400'}

                                    alt={roomDetail?.title}

                                    className="primary-image"

                                />

                            </div>

                            {otherImageUrls.length > 0 && (
                                <div className="thumbnail-images">
                                    {otherImageUrls.map((img, index) => (
                                        <Image
                                            key={index}
                                            src={buildImageUrl(img)}
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



                    {/* Other Info */}

                    <div className="room-section">

                        <h3 className="section-title">Thông tin khác</h3>

                        <div className="info-grid">

                            <div className="info-row">

                                <span className="info-label">Loại khu vực:</span>

                                <span className="info-value">{roomDetail?.areaTypeName || 'N/A'}</span>

                            </div>

                            <div className="info-row">

                                <span className="info-label">Điểm tiện nghi:</span>

                                <span className="info-value">

                                    <Rate disabled defaultValue={roomDetail?.avgAmenity || 0} allowHalf />

                                    {roomDetail?.avgAmenity?.toFixed(1) || 0}

                                </span>

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

                            title={roomDetail?.title}

                            address={roomDetail?.address}

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
