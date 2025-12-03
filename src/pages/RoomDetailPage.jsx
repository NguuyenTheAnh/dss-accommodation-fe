import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Spin, Button, Tabs } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, ExpandOutlined, DollarOutlined, StarFilled } from '@ant-design/icons';
import RoomInfoSection from '../components/RoomInfoSection';
import RouteMapSection from '../components/RouteMapSection';
import DecisionExplanation from '../components/DecisionExplanation';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roomData, setRoomData] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);

    useEffect(() => {
        // Fetch room detail data
        // TODO: Replace with actual API call
        setTimeout(() => {
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
            setLoading(false);
        }, 500);
    }, [id]);

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
