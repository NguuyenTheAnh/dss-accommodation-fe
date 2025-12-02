import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Empty } from 'antd';
import RoomCardHorizontal from '../components/RoomCardHorizontal';
import SidebarFilter from '../components/SidebarFilter';
import CustomPagination from '../components/CustomPagination';
import './SearchResultPage.css';

const SearchResultPage = () => {
    const location = useLocation();
    const [filters, setFilters] = useState({
        priceRange: [1000000, 10000000],
        distance: 5,
        areaRange: [15, 50],
        rating: 0,
        roomType: undefined,
        amenities: []
    });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Mock data - thay bằng API call thực tế
    const amenitiesOptions = ['WiFi', 'Điều hòa', 'Máy giặt', 'Bếp', 'Chỗ đậu xe', 'An ninh 24/7'];

    const mockRooms = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        image: `https://images.unsplash.com/photo-${1522708323590 + index * 100}?w=500`,
        title: `Phòng trọ ${index + 1} - ${['Cao cấp gần trường', 'Tiện nghi đầy đủ', 'Giá sinh viên', 'View đẹp thoáng mát'][index % 4]}`,
        price: `${(2000000 + Math.random() * 6000000).toFixed(0)}`,
        area: `${Math.floor(15 + Math.random() * 40)}`,
        location: ['Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai'][index % 5] + ', Hà Nội',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        distance: `${(0.5 + Math.random() * 3).toFixed(1)}km đến trường`,
        amenities: amenitiesOptions.slice(0, Math.floor(Math.random() * 4) + 2)
    }));

    const totalRooms = mockRooms.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentRooms = mockRooms.slice(startIndex, endIndex);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        console.log('Filters updated:', newFilters);
        // Trigger API call with new filters
    };

    const handleResetFilters = () => {
        const resetFilters = {
            priceRange: [1000000, 10000000],
            distance: 5,
            areaRange: [15, 50],
            rating: 0,
            roomType: undefined,
            amenities: []
        };
        setFilters(resetFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    }; return (
        <div className="search-result-page">
            <div className="container">
                {/* Main Content */}
                <div className="search-content">
                    <Row gutter={24}>
                        {/* Sidebar Filter */}
                        <Col xs={24} lg={7} xl={6}>
                            <SidebarFilter
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </Col>

                        {/* Results */}
                        <Col xs={24} lg={17} xl={18}>
                            <div className="results-section">
                                <div className="results-header">
                                    <h2 className="results-title">
                                        Tìm thấy <span className="text-primary">{totalRooms}</span> phòng trọ
                                    </h2>
                                    <p className="results-count">
                                        Hiển thị {startIndex + 1}-{Math.min(endIndex, totalRooms)} của {totalRooms} kết quả
                                    </p>
                                    <p className="results-subtitle">
                                        Sắp xếp theo: Phù hợp nhất
                                    </p>
                                </div>

                                {currentRooms.length > 0 ? (
                                    <>
                                        <div className="results-list">
                                            {currentRooms.map((room, index) => (
                                                <div
                                                    key={room.id}
                                                    style={{
                                                        animationDelay: `${index * 0.08}s`
                                                    }}
                                                    className="result-item"
                                                >
                                                    <RoomCardHorizontal
                                                        room={room}
                                                        isBest={currentPage === 1 && index === 0}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        <CustomPagination
                                            current={currentPage}
                                            total={totalRooms}
                                            pageSize={pageSize}
                                            onChange={handlePageChange}
                                        />
                                    </>
                                ) : (
                                    <Empty
                                        description="Không tìm thấy phòng trọ phù hợp"
                                        className="empty-results"
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default SearchResultPage;
