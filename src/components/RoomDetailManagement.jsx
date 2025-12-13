import { useState, useEffect } from 'react';

import { Button, Tabs, Tag, Card, Divider, Row, Col, Image, Rate, message, List, Form, Input, InputNumber, Select, Upload } from 'antd';

import { ArrowLeftOutlined, EnvironmentOutlined, ExpandOutlined, DollarOutlined, HomeOutlined, SaveOutlined, UploadOutlined, DeleteFilled, PhoneOutlined, AimOutlined } from '@ant-design/icons';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import { getAllSurveyQuestionsApi, getAllAreaTypesApi, uploadFilesApi, getAllSurveysApi } from '../util/api';

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



    useEffect(() => {

        fetchAreaTypes();

        fetchSurveyData();

        if (room) {

            setRoomDetail(room);

            setSurveyAnswers(room.surveyAnswers || []);

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

            // Láº¥y danh sÃ¡ch táº¥t cáº£ surveys Ä‘á»ƒ biáº¿t ID cá»§a AMENITY vÃ  SECURITY

            const surveysResponse = await getAllSurveysApi();



            if (surveysResponse.code !== '00' || !surveysResponse.data) {

                message.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch kháº£o sÃ¡t');

                return;

            }



            const surveys = surveysResponse.data;

            const amenitySurvey = surveys.find(s => s.type === 'AMENITY');

            const securitySurvey = surveys.find(s => s.type === 'SECURITY');



            // Láº¥y cÃ¢u há»i tá»« cáº£ 2 surveys

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



            // Náº¿u Ä‘ang edit vÃ  cÃ³ room.id, set giÃ¡ trá»‹ tá»« surveyAnswers cá»§a room

            if ((mode === 'edit' || mode === 'view') && roomDetail?.surveyAnswers?.length > 0) {

                const surveyValues = {};

                roomDetail.surveyAnswers.forEach(answer => {

                    surveyValues[`question_${answer.surveyQuestionId}`] = answer.point;

                });

                surveyForm.setFieldsValue(surveyValues);

            }

        } catch (error) {

            console.error('Error fetching survey data:', error);

            message.error('CÃ³ lá»—i xáº£y ra khi táº£i dá»¯ liá»‡u kháº£o sÃ¡t');

        }

    };



    // Khá»Ÿi táº¡o giÃ¡ trá»‹ máº·c Ä‘á»‹nh cho survey form (cháº¿ Ä‘á»™ thÃªm má»›i)

    const initializeSurveyForm = () => {

        const defaultValues = {};

        // Set táº¥t cáº£ cÃ¢u há»i vá» 0 Ä‘iá»ƒm

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

                message.success('Upload áº£nh bÃ¬a thÃ nh cÃ´ng');

            } else {

                message.error('Upload áº£nh bÃ¬a tháº¥t báº¡i');

            }

        } catch (error) {

            console.error('Error uploading cover image:', error);

            message.error('CÃ³ lá»—i xáº£y ra khi upload áº£nh bÃ¬a');

        } finally {

            setUploadingCover(false);

        }

        return false; // Prevent auto upload

    };



    const handleUploadOtherImages = async (file, fileList) => {

        // Chá»‰ xá»­ lÃ½ khi lÃ  file cuá»‘i cÃ¹ng trong danh sÃ¡ch Ä‘á»ƒ trÃ¡nh gá»i nhiá»u láº§n

        const isLastFile = fileList[fileList.length - 1] === file;

        if (!isLastFile) {

            return false;

        }



        try {

            setUploadingOthers(true);

            const formData = new FormData();



            // Upload táº¥t cáº£ files Ä‘Æ°á»£c chá»n

            fileList.forEach(f => {

                formData.append('files', f);

            });



            const response = await uploadFilesApi(formData);



            if (response.code === '00' && response.data && response.data.length > 0) {

                // ThÃªm táº¥t cáº£ áº£nh Ä‘Ã£ upload vÃ o danh sÃ¡ch

                const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

                const newImages = response.data.map(uploadedFile => ({

                    id: uploadedFile.id,

                    url: `${backendUrl}${uploadedFile.url}`

                }));

                setOtherImages(prev => [...prev, ...newImages]);

                message.success(`Upload thÃ nh cÃ´ng ${response.data.length} áº£nh`);

            } else {

                message.error('Upload áº£nh tháº¥t báº¡i');

            }

        } catch (error) {

            console.error('Error uploading image:', error);

            message.error('CÃ³ lá»—i xáº£y ra khi upload áº£nh');

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

            // Validate cáº£ 2 form

            await form.validateFields();

            const surveyValues = await surveyForm.validateFields();



            setLoading(true);



            // Chuyá»ƒn Ä‘á»•i survey values thÃ nh format API

            const surveyAnswers = Object.keys(surveyValues)

                .map(key => {

                    const questionId = parseInt(key.replace('question_', ''));

                    return {

                        surveyQuestionId: questionId,

                        point: surveyValues[key]

                    };

                })

                .filter(answer => answer.point != null && answer.point !== 0); // Chá»‰ gá»­i nhá»¯ng cÃ¢u Ä‘Ã£ tráº£ lá»i



            const roomValues = form.getFieldsValue();



            // Táº¡o object theo Ä‘Ãºng format BE yÃªu cáº§u

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



            // Náº¿u Ä‘ang edit, thÃªm id

            if (roomDetail?.id) {

                updatedRoom.id = roomDetail.id;

            }



            if (onSave) {

                await onSave(updatedRoom);

            }

        } catch (error) {

            if (error.errorFields) {

                message.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin!');

            } else {

                console.error('Error saving room:', error);

                message.error('CÃ³ lá»—i xáº£y ra khi lÆ°u phÃ²ng');

            }

        } finally {

            setLoading(false);

        }

    };



    // Mock map component (sáº½ Ä‘Æ°á»£c BE xá»­ lÃ½ sau)

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

                        Tá»a Ä‘á»™ hiá»‡n táº¡i: <strong>{lat.toFixed(6)}</strong>, <strong>{lng.toFixed(6)}</strong>

                    </p>

                    <p style={{ margin: 0, fontSize: 12, color: '#5f6b7a' }}>

                        (Kinh Ä‘á»™ vÃ  vÄ© Ä‘á»™ dÃ¹ng Ä‘á»ƒ Ä‘á»‹nh vá»‹ chÃ­nh xÃ¡c phÃ²ng trá» trÃªn báº£n Ä‘á»“. HÃ£y kiá»ƒm tra ká»¹ trÆ°á»›c khi lÆ°u.

                        {selecting ? ' Äang chá»n vá»‹ trÃ­, hÃ£y click trÃªn báº£n Ä‘á»“.' : ''}

                        )

                    </p>

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

                        <h3 className="section-title">ThÃ´ng tin cÆ¡ báº£n</h3>



                        <Form.Item

                            label="TÃªn phÃ²ng"

                            name="title"

                            rules={[{ required: true, message: 'Vui lÃ²ng nháº­p tÃªn phÃ²ng' }]}

                        >

                            <Input placeholder="VD: PhÃ²ng trá» cao cáº¥p gáº§n ÄH BÃ¡ch Khoa" size="large" />

                        </Form.Item>



                        <Form.Item

                            label="MÃ´ táº£"

                            name="description"

                        >

                            <TextArea

                                rows={4}

                                placeholder="MÃ´ táº£ chi tiáº¿t vá» phÃ²ng..."

                            />

                        </Form.Item>



                        <Form.Item

                            label="Äá»‹a chá»‰"

                            name="address"

                            rules={[{ required: true, message: 'Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰' }]}

                        >

                            <Input placeholder="VD: 123 Äáº¡i Cá»“ Viá»‡t, Hai BÃ  TrÆ°ng, HÃ  Ná»™i" size="large" />

                        </Form.Item>



                        <Row gutter={16}>

                            <Col span={12}>

                                <Form.Item

                                    label="VÄ© Ä‘á»™ (Latitude)"

                                    name="latitude"

                                    rules={[{ required: true, message: 'Vui lÃ²ng nháº­p vÄ© Ä‘á»™' }]}

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

                                    label="Kinh Ä‘á»™ (Longitude)"

                                    name="longitude"

                                    rules={[{ required: true, message: 'Vui lÃ²ng nháº­p kinh Ä‘á»™' }]}

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

                                    label="GiÃ¡ thuÃª (VNÄ)"

                                    name="priceVnd"

                                    rules={[{ required: true, message: 'Vui lÃ²ng nháº­p giÃ¡ thuÃª' }]}

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

                                    label="Diá»‡n tÃ­ch (mÂ²)"

                                    name="areaSqm"

                                    rules={[{ required: true, message: 'Vui lÃ²ng nháº­p diá»‡n tÃ­ch' }]}

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

                                    label="Loáº¡i phÃ²ng"

                                    name="roomType"

                                    rules={[{ required: true, message: 'Vui lÃ²ng chá»n loáº¡i phÃ²ng' }]}

                                >

                                    <Select placeholder="Chá»n loáº¡i phÃ²ng" size="large">

                                        <Option value={ROOM_TYPE.SINGLE}>{ROOM_TYPE_LABELS[ROOM_TYPE.SINGLE]}</Option>

                                        <Option value={ROOM_TYPE.SHARED}>{ROOM_TYPE_LABELS[ROOM_TYPE.SHARED]}</Option>

                                        <Option value={ROOM_TYPE.STUDIO}>{ROOM_TYPE_LABELS[ROOM_TYPE.STUDIO]}</Option>

                                        <Option value={ROOM_TYPE.APARTMENT}>{ROOM_TYPE_LABELS[ROOM_TYPE.APARTMENT]}</Option>

                                    </Select>

                                </Form.Item>

                            </Col>

                            <Col span={12}>

                                <Form.Item

                                    label="Tráº¡ng thÃ¡i"

                                    name="status"

                                    rules={[{ required: true, message: 'Vui lÃ²ng chá»n tráº¡ng thÃ¡i' }]}

                                >

                                    <Select placeholder="Chá»n tráº¡ng thÃ¡i" size="large">

                                        <Option value={ROOM_STATUS.AVAILABLE}>{ROOM_STATUS_LABELS[ROOM_STATUS.AVAILABLE]}</Option>

                                        <Option value={ROOM_STATUS.RENTED}>{ROOM_STATUS_LABELS[ROOM_STATUS.RENTED]}</Option>

                                    </Select>

                                </Form.Item>

                            </Col>

                        </Row>



                        <Form.Item

                            label="Khu vá»±c"

                            name="areaTypeId"

                            rules={[{ required: true, message: 'Vui lÃ²ng chá»n khu vá»±c' }]}

                        >

                            <Select placeholder="Chá»n khu vá»±c" size="large">

                                {areaTypes.map(area => (

                                    <Option key={area.id} value={area.id}>{area.name}</Option>

                                ))}

                            </Select>

                        </Form.Item>



                        <Divider />



                        <h3 className="section-title">áº¢nh phÃ²ng</h3>



                        <Form.Item label="áº¢nh bÃ¬a">

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

                                        {uploadingCover ? 'Äang táº£i lÃªn...' : 'Chá»n áº£nh bÃ¬a'}

                                    </Button>

                                </Upload>

                            )}

                            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>

                                áº¢nh bÃ¬a sáº½ hiá»ƒn thá»‹ lÃ m áº£nh Ä‘áº¡i diá»‡n cá»§a phÃ²ng

                            </div>

                        </Form.Item>



                        <Form.Item label="áº¢nh khÃ¡c">

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

                                        <span>{uploadingOthers ? 'Äang táº£i...' : '+'}</span>

                                    </Button>

                                </Upload>

                            </div>

                            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>

                                CÃ³ thá»ƒ upload nhiá»u áº£nh Ä‘á»ƒ hiá»ƒn thá»‹ chi tiáº¿t phÃ²ng

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

                            {(roomDetail?.roomNotCoverImageUrls?.length > 0 || roomDetail?.roomNotCoverImages?.length > 0) && (
                                <div className="thumbnail-images">
                                    {[...(roomDetail.roomNotCoverImageUrls || []), ...(roomDetail.roomNotCoverImages || []).map((img) => img.url || img)].map((img, index) => (
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

                                {roomDetail?.avgAmenity?.toFixed(1) || 0} (Tiá»‡n nghi)

                            </span>

                        </div>

                    </div>



                    {/* Price & Area */}

                    <div className="room-quick-info">

                        <div className="info-item price-item">

                            <DollarOutlined className="info-icon" />

                            <div>

                                <span className="price-amount">{roomDetail?.priceVnd?.toLocaleString()}Ä‘</span>

                                <span className="price-period">/thÃ¡ng</span>

                            </div>

                        </div>

                        <div className="info-item">

                            <ExpandOutlined className="info-icon" />

                            <span className="info-text">{roomDetail?.areaSqm}mÂ²</span>

                        </div>

                        <div className="info-item">

                            <HomeOutlined className="info-icon" />

                            <span className="info-text">{ROOM_TYPE_LABELS[roomDetail?.roomType] || roomDetail?.roomType}</span>

                        </div>

                    </div>



                    <Divider />



                    {/* Address */}

                    <div className="room-section">

                        <h3 className="section-title">Äá»‹a chá»‰</h3>

                        <div className="address-info">

                            <EnvironmentOutlined className="location-icon" />

                            <span>{roomDetail?.address}</span>

                        </div>

                    </div>



                    <Divider />



                    {/* Description */}

                    <div className="room-section">

                        <h3 className="section-title">MÃ´ táº£</h3>

                        <p className="room-description">{roomDetail?.description || 'ChÆ°a cÃ³ mÃ´ táº£'}</p>

                    </div>



                    <Divider />



                    {/* Other Info */}

                    <div className="room-section">

                        <h3 className="section-title">ThÃ´ng tin khÃ¡c</h3>

                        <div className="info-grid">

                            <div className="info-row">

                                <span className="info-label">Loáº¡i khu vá»±c:</span>

                                <span className="info-value">{roomDetail?.areaTypeName || 'N/A'}</span>

                            </div>

                            <div className="info-row">

                                <span className="info-label">Äiá»ƒm tiá»‡n nghi:</span>

                                <span className="info-value">

                                    <Rate disabled defaultValue={roomDetail?.avgAmenity || 0} allowHalf />

                                    {roomDetail?.avgAmenity?.toFixed(1) || 0}

                                </span>

                            </div>

                            <div className="info-row">

                                <span className="info-label">Äiá»ƒm an ninh:</span>

                                <span className="info-value">

                                    <Rate disabled defaultValue={roomDetail?.avgSecurity || 0} allowHalf />

                                    {roomDetail?.avgSecurity?.toFixed(1) || 0}

                                </span>

                            </div>

                            <div className="info-row">

                                <span className="info-label">Tráº¡ng thÃ¡i:</span>

                                <Tag color={roomDetail?.status === 'AVAILABLE' ? 'green' : 'red'}>

                                    {ROOM_STATUS_LABELS[roomDetail?.status] || roomDetail?.status}

                                </Tag>

                            </div>

                            {roomDetail?.landlord && (

                                <>

                                    <div className="info-row">

                                        <span className="info-label">Chá»§ nhÃ :</span>

                                        <span className="info-value">{roomDetail.landlord.fullName}</span>

                                    </div>

                                    <div className="info-row">

                                        <span className="info-label">Sá»‘ Ä‘iá»‡n thoáº¡i:</span>

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

                            <div className="stat-label">Tá»•ng cÃ¢u há»i kháº£o sÃ¡t</div>

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

                            <div className="stat-label">Äiá»ƒm trung bÃ¬nh</div>

                        </div>

                    </Card>

                </Col>

            </Row>



            <Divider />



            {/* Survey Questions & Answers */}

            <Card title="Chi tiáº¿t káº¿t quáº£ kháº£o sÃ¡t" className="survey-details-card">

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

                                            ({answer?.totalAnswers || 0} Ä‘Ã¡nh giÃ¡)

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

                    {/* Tiá»‡n nghi Form */}

                    <Col xs={24} lg={12}>

                        <Card

                            title={

                                <div className="survey-card-header">

                                    <span>Form Kháº£o SÃ¡t Tiá»‡n Nghi</span>

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

                                    rules={isEditMode ? [{ required: true, message: 'Vui lÃ²ng Ä‘Ã¡nh giÃ¡ cÃ¢u há»i nÃ y' }] : []}

                                >

                                    <Rate

                                        allowHalf

                                        disabled={!isEditMode}

                                        onChange={() => {

                                            if (isEditMode) {

                                                // Trigger re-render Ä‘á»ƒ cáº­p nháº­t Ä‘iá»ƒm trung bÃ¬nh

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

                                    <span>Form Kháº£o SÃ¡t An Ninh</span>

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

                                    rules={isEditMode ? [{ required: true, message: 'Vui lÃ²ng Ä‘Ã¡nh giÃ¡ cÃ¢u há»i nÃ y' }] : []}

                                >

                                    <Rate

                                        allowHalf

                                        disabled={!isEditMode}

                                        onChange={() => {

                                            if (isEditMode) {

                                                // Trigger re-render Ä‘á»ƒ cáº­p nháº­t Ä‘iá»ƒm trung bÃ¬nh

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

                                {isAddMode ? 'Táº¡o phÃ²ng má»›i' : 'LÆ°u thay Ä‘á»•i'}

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

            label: 'ThÃ´ng tin chi tiáº¿t',

            children: roomInfoTab

        },

        {

            key: 'survey-form',

            label: 'Form kháº£o sÃ¡t',

            children: surveyFormTab

        }

    ];



    const getHeaderTitle = () => {

        if (isAddMode) return 'ThÃªm phÃ²ng má»›i';

        if (isEditMode) return `Chá»‰nh sá»­a: ${roomDetail?.title || ''}`;

        return roomDetail?.title || room?.title || room?.name || 'Chi tiáº¿t phÃ²ng';

    };



    return (

        <div className="room-detail-management">

            <div className="detail-header">

                <Button

                    icon={<ArrowLeftOutlined />}

                    onClick={onBack}

                    size="large"

                >

                    Quay láº¡i

                </Button>

                <div className="detail-title">

                    <h1>{getHeaderTitle()}</h1>

                    {!isAddMode && (

                        <Tag color={room?.status === ROOM_STATUS.AVAILABLE || room?.status === 'AVAILABLE' ? 'green' : 'red'}>

                            {ROOM_STATUS_LABELS[room?.status] || (room?.status === 'available' ? 'CÃ²n trá»‘ng' : 'ÄÃ£ thuÃª')}

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


