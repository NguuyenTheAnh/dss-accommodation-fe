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

            // MOCK API - Success case with search results
            const allMockRooms = [
                {
                    id: 1,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
                    description: 'Phòng rộng rãi, đầy đủ tiện nghi',
                    address: '123 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
                    latitude: 21.0285,
                    longitude: 105.8542,
                    priceVnd: 3500000,
                    areaSqm: 25,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.8,
                    avgSecurity: 4.5,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
                },
                {
                    id: 2,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Chung cư mini đầy đủ tiện nghi',
                    description: 'View đẹp, an ninh tốt',
                    address: '45 Xuân Thủy, Cầu Giấy, Hà Nội',
                    latitude: 21.0380,
                    longitude: 105.7820,
                    priceVnd: 5000000,
                    areaSqm: 35,
                    roomType: 'STUDIO',
                    status: 'AVAILABLE',
                    avgAmenity: 4.9,
                    avgSecurity: 4.7,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                },
                {
                    id: 3,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Phòng đơn giá rẻ an ninh tốt',
                    description: 'Phòng sạch sẽ, chủ nhà thân thiện',
                    address: '78 Tây Sơn, Đống Đa, Hà Nội',
                    latitude: 21.0245,
                    longitude: 105.8270,
                    priceVnd: 2000000,
                    areaSqm: 20,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.2,
                    avgSecurity: 4.3,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
                },
                {
                    id: 4,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Phòng đôi thoáng mát, view đẹp',
                    description: 'Gần siêu thị, bệnh viện',
                    address: '12 Nguyễn Trãi, Thanh Xuân, Hà Nội',
                    latitude: 21.0015,
                    longitude: 105.8050,
                    priceVnd: 4000000,
                    areaSqm: 30,
                    roomType: 'SHARED',
                    status: 'AVAILABLE',
                    avgAmenity: 4.6,
                    avgSecurity: 4.4,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500'
                },
                {
                    id: 5,
                    landlordUserId: 1,
                    areaTypeId: 3,
                    title: 'Nhà nguyên căn 3 phòng ngủ',
                    description: 'Yên tĩnh, không khí trong lành',
                    address: '89 Vũ Trọng Phụng, Hoàng Mai, Hà Nội',
                    latitude: 20.9850,
                    longitude: 105.8450,
                    priceVnd: 8000000,
                    areaSqm: 60,
                    roomType: 'APARTMENT',
                    status: 'AVAILABLE',
                    avgAmenity: 4.9,
                    avgSecurity: 4.8,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
                },
                {
                    id: 6,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Studio hiện đại full nội thất',
                    description: 'Điều hòa, WiFi miễn phí',
                    address: '34 Nguyễn Chí Thanh, Ba Đình, Hà Nội',
                    latitude: 21.0325,
                    longitude: 105.8150,
                    priceVnd: 6000000,
                    areaSqm: 28,
                    roomType: 'STUDIO',
                    status: 'AVAILABLE',
                    avgAmenity: 4.7,
                    avgSecurity: 4.6,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500'
                },
                {
                    id: 7,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Phòng trọ sinh viên giá tốt',
                    description: 'Gần trường, siêu thị',
                    address: '56 Giải Phóng, Hai Bà Trưng, Hà Nội',
                    latitude: 21.0050,
                    longitude: 105.8450,
                    priceVnd: 2500000,
                    areaSqm: 22,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.3,
                    avgSecurity: 4.2,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
                },
                {
                    id: 8,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Căn hộ dịch vụ cao cấp',
                    description: 'Đầy đủ nội thất, dọn vệ sinh hàng tuần',
                    address: '23 Kim Mã, Ba Đình, Hà Nội',
                    latitude: 21.0290,
                    longitude: 105.8200,
                    priceVnd: 7000000,
                    areaSqm: 40,
                    roomType: 'APARTMENT',
                    status: 'AVAILABLE',
                    avgAmenity: 4.9,
                    avgSecurity: 4.9,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                }
            ];

            // Apply filters
            let filteredRooms = allMockRooms.filter(room => {
                // Price range filter
                if (filters.priceRange) {
                    if (room.priceVnd < filters.priceRange[0] || room.priceVnd > filters.priceRange[1]) {
                        return false;
                    }
                }

                // Area range filter
                if (filters.areaRange) {
                    if (room.areaSqm < filters.areaRange[0] || room.areaSqm > filters.areaRange[1]) {
                        return false;
                    }
                }

                // Room type filter
                if (filters.roomType && room.roomType !== filters.roomType) {
                    return false;
                }

                // Area type filter
                if (filters.areaTypeId && room.areaTypeId !== filters.areaTypeId) {
                    return false;
                }

                // Amenity score filter
                if (filters.amenityRange) {
                    if (room.avgAmenity < filters.amenityRange[0] || room.avgAmenity > filters.amenityRange[1]) {
                        return false;
                    }
                }

                // Security score filter
                if (filters.securityRange) {
                    if (room.avgSecurity < filters.securityRange[0] || room.avgSecurity > filters.securityRange[1]) {
                        return false;
                    }
                }

                // Distance range filter (mock - giả sử tất cả phòng đều trong khoảng 0-5km)
                // Trong thực tế sẽ tính khoảng cách dựa trên latitude/longitude

                // School filter (mock - hiện tại chỉ có 1 trường HUST nên không filter)

                return true;
            });

            const response = {
                code: '00',
                message: null,
                data: {
                    pageNumber: currentPage - 1,
                    pageSize: pageSize,
                    totalElements: filteredRooms.length,
                    totalPages: Math.ceil(filteredRooms.length / pageSize),
                    data: filteredRooms.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                }
            };

            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.code === '00' && response.data) {
                setCurrentRooms(response.data.data || []);
                setTotalRooms(response.data.totalElements || 0);
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
        setFilters(newFilters);
        setCurrentPage(1);
        console.log('Filters updated:', newFilters);
        // Trigger API call with new filters
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
