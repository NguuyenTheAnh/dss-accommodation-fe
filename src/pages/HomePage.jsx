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
            const response = await getFeaturedRoomsApi();

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
            }
        } catch (error) {
            console.error('Error fetching featured rooms:', error);
            message.error('Có lỗi xảy ra khi tải danh sách phòng');
        } finally {
            setLoading(false);
        }
    };

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
