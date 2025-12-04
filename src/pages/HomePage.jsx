import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin, message } from 'antd';
import SearchBox from '../components/SearchBox';
import RoomCard from '../components/RoomCard';
import FilterModal from '../components/FilterModal';
import { getFeaturedRoomsApi } from '../util/api';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({});
    const [suggestedRooms, setSuggestedRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedRooms();
    }, []);

    const fetchFeaturedRooms = async () => {
        try {
            setLoading(true);

            // MOCK API - Success case with featured rooms
            const response = {
                code: '00',
                message: null,
                data: [
                    {
                        id: 1,
                        landlordUserId: 1,
                        areaTypeId: 1,
                        title: 'Ph\u00f2ng tr\u1ecd cao c\u1ea5p g\u1ea7n \u0110H B\u00e1ch Khoa',
                        description: 'Ph\u00f2ng r\u1ed9ng r\u00e3i, \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi',
                        address: '123 \u0110\u1ea1i C\u1ed3 Vi\u1ec7t, Hai B\u00e0 Tr\u01b0ng, H\u00e0 N\u1ed9i',
                        latitude: 21.0285,
                        longitude: 105.8542,
                        priceVnd: 3500000,
                        areaSqm: 25,
                        roomType: 'SINGLE',
                        status: 'AVAILABLE',
                        avgAmenity: 4.8,
                        avgSecurity: 4.5,
                        roomCoverImageId: 1,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
                    },
                    {
                        id: 2,
                        landlordUserId: 1,
                        areaTypeId: 2,
                        title: 'Chung c\u01b0 mini \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi',
                        description: 'View \u0111\u1eb9p, an ninh t\u1ed1t',
                        address: '45 Xu\u00e2n Th\u1ee7y, C\u1ea7u Gi\u1ea5y, H\u00e0 N\u1ed9i',
                        latitude: 21.0380,
                        longitude: 105.7820,
                        priceVnd: 5000000,
                        areaSqm: 35,
                        roomType: 'STUDIO',
                        status: 'AVAILABLE',
                        avgAmenity: 4.9,
                        avgSecurity: 4.7,
                        roomCoverImageId: 2,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                    },
                    {
                        id: 3,
                        landlordUserId: 1,
                        areaTypeId: 1,
                        title: 'Ph\u00f2ng \u0111\u01a1n gi\u00e1 r\u1ebb an ninh t\u1ed1t',
                        description: 'Ph\u00f2ng s\u1ea1ch s\u1ebd, ch\u1ee7 nh\u00e0 th\u00e2n thi\u1ec7n',
                        address: '78 T\u00e2y S\u01a1n, \u0110\u1ed1ng \u0110a, H\u00e0 N\u1ed9i',
                        latitude: 21.0245,
                        longitude: 105.8270,
                        priceVnd: 2000000,
                        areaSqm: 20,
                        roomType: 'SINGLE',
                        status: 'AVAILABLE',
                        avgAmenity: 4.2,
                        avgSecurity: 4.3,
                        roomCoverImageId: 3,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
                    },
                    {
                        id: 4,
                        landlordUserId: 1,
                        areaTypeId: 2,
                        title: 'Ph\u00f2ng \u0111\u00f4i tho\u00e1ng m\u00e1t, view \u0111\u1eb9p',
                        description: 'G\u1ea7n si\u00eau th\u1ecb, b\u1ec7nh vi\u1ec7n',
                        address: '12 Nguy\u1ec5n Tr\u00e3i, Thanh Xu\u00e2n, H\u00e0 N\u1ed9i',
                        latitude: 21.0015,
                        longitude: 105.8050,
                        priceVnd: 4000000,
                        areaSqm: 30,
                        roomType: 'SHARED',
                        status: 'AVAILABLE',
                        avgAmenity: 4.6,
                        avgSecurity: 4.4,
                        roomCoverImageId: 4,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500'
                    },
                    {
                        id: 5,
                        landlordUserId: 1,
                        areaTypeId: 3,
                        title: 'Nh\u00e0 nguy\u00ean c\u0103n 3 ph\u00f2ng ng\u1ee7',
                        description: 'Y\u00ean t\u0129nh, kh\u00f4ng kh\u00ed trong l\u00e0nh',
                        address: '89 V\u0169 Tr\u1ecdng Ph\u1ee5ng, Ho\u00e0ng Mai, H\u00e0 N\u1ed9i',
                        latitude: 20.9850,
                        longitude: 105.8450,
                        priceVnd: 8000000,
                        areaSqm: 60,
                        roomType: 'APARTMENT',
                        status: 'AVAILABLE',
                        avgAmenity: 4.9,
                        avgSecurity: 4.8,
                        roomCoverImageId: 5,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
                    },
                    {
                        id: 6,
                        landlordUserId: 1,
                        areaTypeId: 2,
                        title: 'Studio hi\u1ec7n \u0111\u1ea1i full n\u1ed9i th\u1ea5t',
                        description: '\u0110i\u1ec7u h\u00f2a, WiFi mi\u1ec5n ph\u00ed',
                        address: '34 Nguy\u1ec5n Ch\u00ed Thanh, Ba \u0110\u00ecnh, H\u00e0 N\u1ed9i',
                        latitude: 21.0325,
                        longitude: 105.8150,
                        priceVnd: 6000000,
                        areaSqm: 28,
                        roomType: 'STUDIO',
                        status: 'AVAILABLE',
                        avgAmenity: 4.7,
                        avgSecurity: 4.6,
                        roomCoverImageId: 6,
                        roomCoverImageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500'
                    }
                ]
            };

            await new Promise(resolve => setTimeout(resolve, 600));

            if (response.code === '00') {
                // Map API data to component format
                const mappedRooms = response.data.map(room => ({
                    id: room.id,
                    image: room.roomCoverImageUrl,
                    title: room.title,
                    price: (room.priceVnd / 1000).toFixed(0) + '.000',
                    area: room.areaSqm.toString(),
                    location: room.address.split(',').slice(-2).join(',').trim(),
                    rating: room.avgAmenity || room.avgSecurity || 4.5,
                    distance: '500m \u0111\u1ebfn tr\u01b0\u1eddng'
                }));
                setSuggestedRooms(mappedRooms);
            } else {
                message.error(response.message || 'Không thể tải danh sách phòng');
                // Fallback to mock data if API fails
                setSuggestedRooms(getMockRooms());
            }
        } catch (error) {
            console.error('Error fetching featured rooms:', error);
            // Fallback to mock data if API not ready
            setSuggestedRooms(getMockRooms());
        } finally {
            setLoading(false);
        }
    };

    const getMockRooms = () => [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
            title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
            price: '3.500.000',
            area: '25',
            location: 'Hai Bà Trưng, Hà Nội',
            rating: 4.8,
            distance: '500m đến trường'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
            title: 'Chung cư mini đầy đủ tiện nghi',
            price: '5.000.000',
            area: '35',
            location: 'Đống Đa, Hà Nội',
            rating: 4.5,
            distance: '1.2km đến trường'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
            title: 'Phòng đơn giá rẻ an ninh tốt',
            price: '2.000.000',
            area: '20',
            location: 'Cầu Giấy, Hà Nội',
            rating: 4.2,
            distance: '800m đến trường'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500',
            title: 'Phòng đôi thoáng mát, view đẹp',
            price: '4.000.000',
            area: '30',
            location: 'Thanh Xuân, Hà Nội',
            rating: 4.6,
            distance: '1.5km đến trường'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500',
            title: 'Nhà nguyên căn 3 phòng ngủ',
            price: '8.000.000',
            area: '60',
            location: 'Hoàng Mai, Hà Nội',
            rating: 4.9,
            distance: '2km đến trường'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500',
            title: 'Studio hiện đại full nội thất',
            price: '6.000.000',
            area: '28',
            location: 'Ba Đình, Hà Nội',
            rating: 4.7,
            distance: '1km đến trường'
        }
    ];

    const handleSearch = (searchParams) => {
        console.log('Search params:', searchParams);
        navigate('/search', { state: { searchParams, filters } });
    };

    const handleFilterClick = () => {
        setFilterModalVisible(true);
    };

    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
        console.log('Filters applied:', newFilters);
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title fade-in">
                            Tìm phòng trọ <span className="text-primary">hoàn hảo</span>
                        </h1>
                        <p className="hero-subtitle fade-in">
                            Khám phá hàng nghìn phòng trọ, chung cư mini gần trường đại học với giá cả hợp lý
                        </p>
                        <div className="search-box-wrapper slide-in-up">
                            <SearchBox
                                variant="hero"
                                onSearch={handleSearch}
                                onFilterClick={handleFilterClick}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Suggested Rooms Section */}
            <section className="suggested-section">
                <div className="container">
                    <h2 className="section-title">Phòng trọ mới nhất</h2>
                    <p className="section-subtitle">
                        Những phòng trọ được đăng gần đây với vị trí đẹp, giá tốt
                    </p>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[24, 24]} className="rooms-grid">
                            {suggestedRooms.map((room, index) => (
                                <Col
                                    key={room.id}
                                    xs={24}
                                    sm={12}
                                    lg={8}
                                    style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                    className="room-col"
                                >
                                    <RoomCard room={room} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </section>

            {/* Filter Modal */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleFilterApply}
                initialFilters={filters}
            />
        </div>
    );
};

export default HomePage;
