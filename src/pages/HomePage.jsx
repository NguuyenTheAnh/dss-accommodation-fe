import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import SearchBox from '../components/SearchBox';
import RoomCard from '../components/RoomCard';
import FilterModal from '../components/FilterModal';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({});

    // Mock data - thay bằng API call thực tế
    const suggestedRooms = [
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
