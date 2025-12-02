import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Row, Col, Empty } from 'antd';
import SearchBox from '../components/SearchBox';
import RoomCard from '../components/RoomCard';
import SidebarFilter from '../components/SidebarFilter';
import FilterModal from '../components/FilterModal';
import CustomPagination from '../components/CustomPagination';
import './SearchResultPage.css';

const SearchResultPage = () => {
    const location = useLocation();
    const [filters, setFilters] = useState(location.state?.filters || {});
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Mock data - thay bằng API call thực tế
    const mockRooms = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        image: `https://images.unsplash.com/photo-${1522708323590 + index}?w=500`,
        title: `Phòng trọ ${index + 1} - ${['Cao cấp', 'Tiện nghi', 'Giá rẻ', 'View đẹp'][index % 4]}`,
        price: `${(2000000 + Math.random() * 6000000).toFixed(0)}`,
        area: `${Math.floor(15 + Math.random() * 40)}`,
        location: ['Hai Bà Trưng', 'Đống Đa', 'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai'][index % 5] + ', Hà Nội',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        distance: `${(0.5 + Math.random() * 3).toFixed(1)}km đến trường`
    }));

    const totalRooms = mockRooms.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentRooms = mockRooms.slice(startIndex, endIndex);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleSearch = (searchParams) => {
        console.log('New search:', searchParams);
        setCurrentPage(1);
        // Trigger API call with new search params
    };

    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        console.log('Filters applied:', newFilters);
        // Trigger API call with new filters
    };

    const handleRemoveFilter = (filterKey, newValue) => {
        const updatedFilters = { ...filters };

        if (newValue !== undefined) {
            updatedFilters[filterKey] = newValue;
        } else {
            delete updatedFilters[filterKey];
        }

        setFilters(updatedFilters);
        setCurrentPage(1);
    };

    const handleClearAllFilters = () => {
        setFilters({});
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="search-result-page">
            <div className="container">
                {/* Search Bar */}
                <div className="search-bar-section">
                    <SearchBox
                        variant="inline"
                        onSearch={handleSearch}
                        onFilterClick={() => setFilterModalVisible(true)}
                    />
                </div>

                {/* Main Content */}
                <div className="search-content">
                    <Row gutter={24}>
                        {/* Sidebar Filter */}
                        <Col xs={24} lg={6}>
                            <SidebarFilter
                                filters={filters}
                                onRemoveFilter={handleRemoveFilter}
                                onClearAll={handleClearAllFilters}
                                onOpenModal={() => setFilterModalVisible(true)}
                            />
                        </Col>

                        {/* Results */}
                        <Col xs={24} lg={18}>
                            <div className="results-section">
                                <div className="results-header">
                                    <h2 className="results-title">
                                        Tìm thấy <span className="text-primary">{totalRooms}</span> phòng trọ
                                    </h2>
                                </div>

                                {currentRooms.length > 0 ? (
                                    <>
                                        <Row gutter={[20, 20]} className="results-grid">
                                            {currentRooms.map((room, index) => (
                                                <Col
                                                    key={room.id}
                                                    xs={24}
                                                    md={12}
                                                    xl={8}
                                                    style={{
                                                        animationDelay: `${index * 0.05}s`
                                                    }}
                                                    className="result-col"
                                                >
                                                    <RoomCard room={room} />
                                                </Col>
                                            ))}
                                        </Row>

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

export default SearchResultPage;
