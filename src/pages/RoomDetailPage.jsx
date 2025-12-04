import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Button, Tabs, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import RoomInfoSection from '../components/RoomInfoSection';
import RouteMapSection from '../components/RouteMapSection';
import DecisionExplanation from '../components/DecisionExplanation';
import { getPublicRoomDetailApi } from '../util/api';
import { DEFAULT_COORDINATES } from '../util/constants';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roomData, setRoomData] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);

    useEffect(() => {
        fetchRoomDetail();
    }, [id]);

    const fetchRoomDetail = async () => {
        try {
            setLoading(true);

            // MOCK API - Success case with detailed room info
            const mockRoomData = {
                id: parseInt(id),
                landlordUserId: 1,
                areaTypeId: 1,
                title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
                description: 'Phòng rộng rãi, đầy đủ tiện nghi, an ninh 24/7. Gần trường học, siêu thị, bệnh viện. Chủ nhà thân thiện, hỗ trợ nhiệt tình.',
                address: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
                latitude: 21.0285,
                longitude: 105.8542,
                priceVnd: 3500000,
                areaSqm: 25,
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
                ],
                landlord: {
                    fullName: 'Nguyễn Văn A',
                    phoneNumber: '0912345678'
                }
            };

            const response = {
                code: '00',
                message: null,
                data: mockRoomData
            };

            await new Promise(resolve => setTimeout(resolve, 600));

            if (response.code === '00' && response.data) {
                const room = response.data;
                // Map API data to component format
                const mappedRoom = {
                    id: room.id,
                    title: room.title,
                    description: room.description || 'Chưa có mô tả',
                    price: room.priceVnd,
                    area: room.areaSqm,
                    address: room.address,
                    location: {
                        lat: room.latitude || DEFAULT_COORDINATES.latitude,
                        lng: room.longitude || DEFAULT_COORDINATES.longitude,
                        district: room.address?.split(',')[1]?.trim() || 'Hà Nội'
                    },
                    images: room.roomCoverImageUrl ? [room.roomCoverImageUrl] : ['https://via.placeholder.com/600x400'],
                    rating: room.avgAmenity || room.avgSecurity || 4.5,
                    reviewCount: 0,
                    amenities: ['WiFi', 'Điều hòa', 'Máy giặt', 'Bếp', 'Chỗ đậu xe', 'An ninh 24/7'],
                    roomType: room.roomType || 'Phòng đơn',
                    rules: 'Liên hệ chủ nhà để biết thêm chi tiết',
                    landlord: room.landlord,
                    dssData: {
                        rawAttributes: {
                            price: room.priceVnd,
                            area: room.areaSqm,
                            distance: 1.2,
                            rating: room.avgAmenity || 4.5,
                            amenitiesCount: 6,
                            securityScore: room.avgSecurity || 4.5
                        },
                        normalizedAttributes: {
                            price: 0.75,
                            area: 0.65,
                            distance: 0.88,
                            rating: (room.avgAmenity || 4.5) / 5,
                            amenitiesCount: 1.0,
                            securityScore: (room.avgSecurity || 4.5) / 5
                        },
                        weights: {
                            price: 0.25,
                            area: 0.15,
                            distance: 0.30,
                            rating: 0.10,
                            amenitiesCount: 0.10,
                            securityScore: 0.10
                        },
                        totalScore: 0.828,
                        rank: 1,
                        normalizationMethod: 'Min-Max Scaling',
                        explanation: [
                            `Điểm tiện nghi: ${room.avgAmenity?.toFixed(1) || 'N/A'}/5.0`,
                            `Điểm an ninh: ${room.avgSecurity?.toFixed(1) || 'N/A'}/5.0`,
                            `Giá thuê: ${room.priceVnd?.toLocaleString()}đ/tháng`,
                            `Diện tích: ${room.areaSqm}m²`,
                            'Khoảng cách đến trường: 1.2km (rất gần)'
                        ]
                    },
                    routeToSchool: {
                        school: {
                            name: 'Trường của bạn',
                            lat: DEFAULT_COORDINATES.latitude + 0.001,
                            lng: DEFAULT_COORDINATES.longitude + 0.002
                        },
                        distance: 1.2,
                        geometry: [
                            [room.latitude || DEFAULT_COORDINATES.latitude, room.longitude || DEFAULT_COORDINATES.longitude],
                            [DEFAULT_COORDINATES.latitude + 0.001, DEFAULT_COORDINATES.longitude + 0.002]
                        ]
                    }
                };
                setRoomData(mappedRoom);
                setSelectedSchool(mappedRoom.routeToSchool.school);
            } else {
                message.error(response.message || 'Không thể tải thông tin phòng');
            }
        } catch (error) {
            console.error('Error fetching room detail:', error);
            message.error('Có lỗi xảy ra khi tải thông tin phòng');
            // Fallback to mock data
            loadMockData();
        } finally {
            setLoading(false);
        }
    };

    const loadMockData = () => {
        // Mock data với thông tin DSS
        const mockRoom = {
            id: id,
            title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
            description: 'Phòng rộng rãi, đầy đủ tiện nghi, an ninh 24/7. Gần trường học, siêu thị, bệnh viện. Chủ nhà thân thiện, hỗ trợ nhiệt tình.',
            price: 3500000,
            area: 25,
            address: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
            location: {
                lat: 21.0045,
                lng: 105.8412,
                district: 'Hai Bà Trưng'
            },
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
            ],
            rating: 4.5,
            reviewCount: 23,
            amenities: ['WiFi', 'Điều hòa', 'Máy giặt', 'Bếp', 'Chỗ đậu xe', 'An ninh 24/7'],
            roomType: 'Phòng đơn',
            rules: 'Không hút thuốc, không nuôi thú cưng, giữ vệ sinh chung',

            // DSS Decision Support Data
            dssData: {
                // Thuộc tính gốc
                rawAttributes: {
                    price: 3500000,
                    area: 25,
                    distance: 1.2,
                    rating: 4.5,
                    amenitiesCount: 6,
                    securityScore: 9
                },
                // Thuộc tính sau chuẩn hóa (0-1)
                normalizedAttributes: {
                    price: 0.75,        // Giá tốt (càng thấp càng tốt → normalize ngược)
                    area: 0.65,         // Diện tích vừa phải
                    distance: 0.88,     // Rất gần trường (càng gần càng tốt)
                    rating: 0.9,        // Rating cao
                    amenitiesCount: 1.0,// Đầy đủ tiện nghi
                    securityScore: 0.9  // An ninh tốt
                },
                // Trọng số của từng tiêu chí
                weights: {
                    price: 0.25,
                    area: 0.15,
                    distance: 0.30,
                    rating: 0.10,
                    amenitiesCount: 0.10,
                    securityScore: 0.10
                },
                // Điểm số tổng hợp
                totalScore: 0.828,
                rank: 1,
                // Quá trình chuẩn hóa
                normalizationMethod: 'Min-Max Scaling',
                // Giải thích
                explanation: [
                    'Phòng này được xếp hạng cao nhất do khoảng cách đến trường rất gần (1.2km - điểm chuẩn hóa: 0.88)',
                    'Giá thuê hợp lý so với khu vực (3.5tr/tháng - điểm chuẩn hóa: 0.75)',
                    'Đầy đủ 6 tiện nghi cần thiết (điểm: 1.0)',
                    'An ninh đảm bảo với camera 24/7 (điểm: 0.9)',
                    'Rating cao từ người thuê trước (4.5/5 sao - điểm: 0.9)'
                ]
            },

            // Route to schools
            routeToSchool: {
                school: {
                    name: 'ĐH Bách Khoa Hà Nội',
                    lat: 21.0054,
                    lng: 105.8433
                },
                distance: 1.2,
                geometry: [
                    [21.0045, 105.8412],
                    [21.0048, 105.8420],
                    [21.0051, 105.8428],
                    [21.0054, 105.8433]
                ]
            }
        };

        setRoomData(mockRoom);
        setSelectedSchool(mockRoom.routeToSchool.school);
    };

    if (loading) {
        return (
            <div className="room-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="room-detail-error">
                <p>Không tìm thấy thông tin phòng</p>
                <Button type="primary" onClick={() => navigate('/search')}>
                    Quay lại tìm kiếm
                </Button>
            </div>
        );
    }

    const tabItems = [
        {
            key: 'map',
            label: 'Bản đồ đường đi',
            children: (
                <RouteMapSection
                    roomLocation={roomData.location}
                    schoolLocation={selectedSchool}
                    routeGeometry={roomData.routeToSchool.geometry}
                    distance={roomData.routeToSchool.distance}
                />
            )
        },
        {
            key: 'explanation',
            label: 'Giải thích chuyên sâu',
            children: (
                <DecisionExplanation
                    dssData={roomData.dssData}
                    roomTitle={roomData.title}
                />
            )
        }
    ];

    return (
        <div className="room-detail-page">
            <div className="container">
                <Button
                    className="back-button"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>

                <Row gutter={[24, 24]} className="room-detail-content">
                    {/* Left Column - Room Info */}
                    <Col xs={24} lg={10}>
                        <div className="left-column-scroll">
                            <RoomInfoSection roomData={roomData} />
                        </div>
                    </Col>

                    {/* Right Column - Map & Explanation */}
                    <Col xs={24} lg={14}>
                        <div className="right-column-scroll">
                            <div className="right-section">
                                <Tabs
                                    defaultActiveKey="map"
                                    items={tabItems}
                                    className="detail-tabs"
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default RoomDetailPage;
