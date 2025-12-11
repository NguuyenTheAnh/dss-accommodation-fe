import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Spin } from 'antd';
import SearchBox from '../components/SearchBox';
import RoomCard from '../components/RoomCard';
import FilterModal from '../components/FilterModal';
import './HomePage.css';

const MOCK_FEATURED_ROOMS = [
    {
        id: 'mock-1',
        title: 'Studio sáng sủa gần Bách Khoa',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
        price: '3.200.000',
        area: '24',
        location: 'Hai Ba Trung, Ha Noi',
        rating: 4.8,
        distance: '450m den truong'
    },
    {
        id: 'mock-2',
        title: 'Căn hộ mini có ban công',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
        price: '3.800.000',
        area: '28',
        location: 'Dong Da, Ha Noi',
        rating: 4.7,
        distance: '750m den truong'
    },
    {
        id: 'mock-3',
        title: 'Phòng trọ đẹp trong khu dân trí',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
        price: '2.900.000',
        area: '22',
        location: 'Cau Giay, Ha Noi',
        rating: 4.6,
        distance: '1km den truong'
    },
    {
        id: 'mock-4',
        title: 'Phòng đơn thang máy, để xe riêng',
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80',
        price: '3.500.000',
        area: '26',
        location: 'Thanh Xuan, Ha Noi',
        rating: 4.9,
        distance: '600m den truong'
    },
    {
        id: 'mock-5',
        title: 'Căn hộ 1 ngủ sang trọng',
        image: 'https://plus.unsplash.com/premium_photo-1661879252375-7c1db1932572?auto=format&fit=crop&w=900&q=80',
        price: '4.200.000',
        area: '32',
        location: 'Hoang Mai, Ha Noi',
        rating: 4.8,
        distance: '900m den truong'
    },
    {
        id: 'mock-6',
        title: 'Phòng trọ full đồ cho sinh viên',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
        price: '2.700.000',
        area: '20',
        location: 'Nam Tu Liem, Ha Noi',
        rating: 4.5,
        distance: '1.3km den truong'
    }
];

const HomePage = () => {
    const navigate = useNavigate();
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({});
    const [suggestedRooms, setSuggestedRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use mock data for featured rooms (BE chưa cung cấp API)
        setSuggestedRooms(MOCK_FEATURED_ROOMS);
        setLoading(false);
    }, []);

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
