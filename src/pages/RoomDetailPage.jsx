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
            const response = await getRoomDetailApi(id);

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
        } finally {
            setLoading(false);
        }
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
