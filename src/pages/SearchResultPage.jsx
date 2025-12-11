import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Empty, Spin, message } from 'antd';
import RoomCardHorizontal from '../components/RoomCardHorizontal';
import SidebarFilter from '../components/SidebarFilter';
import CustomPagination from '../components/CustomPagination';
import { searchRoomsApi } from '../util/api';
import './SearchResultPage.css';

const SearchResultPage = () => {
    const location = useLocation();
    const [filters, setFilters] = useState({
        schoolId: undefined,
        priceRange: [1000000, 10000000],
        distanceRange: [0, 5],
        areaRange: [15, 50],
        roomType: undefined,
        areaTypeId: undefined,
        amenityRange: [1, 5],
        securityRange: [1, 5]
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRooms, setTotalRooms] = useState(0);
    const [currentRooms, setCurrentRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        fetchRooms();
    }, [currentPage, filters]);

    const fetchRooms = async () => {
        try {
            setLoading(true);

            const searchParams = {
                pageNumber: currentPage - 1,
                pageSize: pageSize,
                ...filters
            };

            const response = await searchRoomsApi(searchParams);

            if (response.code === '00' && response.data) {
                const roomsData = response.data.data || [];
                setCurrentRooms(roomsData);
                setTotalRooms(response.data.totalElements || 0);
                try {
                    localStorage.setItem('roomsListCache', JSON.stringify(roomsData));
                } catch (e) {
                    console.warn('Cannot cache rooms list', e);
                }
            } else {
                message.error(response.message || 'Không thể tải danh sách phòng');
                setCurrentRooms([]);
                setTotalRooms(0);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            message.error('Có lỗi xảy ra khi tải danh sách phòng');
            setCurrentRooms([]);
            setTotalRooms(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const handleFilterChange = (newFilters) => {
        console.log('Filters updated:', newFilters);
        setFilters(newFilters);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
        // useEffect will trigger API call automatically
    };

    const handleResetFilters = () => {
        const resetFilters = {
            schoolId: undefined,
            priceRange: [1000000, 10000000],
            distanceRange: [0, 5],
            areaRange: [15, 50],
            roomType: undefined,
            areaTypeId: undefined,
            amenityRange: [1, 5],
            securityRange: [1, 5]
        };
        setFilters(resetFilters);
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
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

                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                        <Spin size="large" />
                                    </div>
                                ) : currentRooms.length > 0 ? (
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
