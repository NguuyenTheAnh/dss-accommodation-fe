import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Empty, Spin, message, Button } from 'antd';
import RoomCardHorizontal from '../components/RoomCardHorizontal';
import SidebarFilter from '../components/SidebarFilter';
import CustomPagination from '../components/CustomPagination';
import { searchRoomsApi } from '../util/api';
import './SearchResultPage.css';

const SearchResultPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    schoolId: undefined,
    priceRange: [1000000, 10000000],
    distanceRange: [0, 5],
    areaRange: [15, 50],
    roomType: undefined,
    areaTypeId: undefined,
    amenityRange: [1, 5],
    securityRange: [1, 5],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [currentRooms, setCurrentRooms] = useState([]);
  const [initMatrix, setInitMatrix] = useState([]);
  const [rowIdsInMatrix, setRowIdsInMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topsisLoading, setTopsisLoading] = useState(false);
  const topsisTimerRef = useRef(null);
  const pageSize = 10;

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const searchParams = {
        pageNumber: currentPage - 1,
        pageSize,
        ...filters,
      };

      const response = await searchRoomsApi(searchParams);

      if (response.code === '00' && response.data) {
        const roomsData = response.data.data || [];
        const matrixData = response.data.initMatrix || [];
        const rowIds = response.data.rowIdsInMatrix || [];

        setCurrentRooms(roomsData);
        setTotalRooms(response.data.totalElements || 0);
        setInitMatrix(matrixData);
        setRowIdsInMatrix(rowIds);

        try {
          localStorage.setItem('roomsListCache', JSON.stringify(roomsData));
          localStorage.setItem('roomsInitMatrix', JSON.stringify(matrixData));
          localStorage.setItem('roomsRowIds', JSON.stringify(rowIds));
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
    setFilters(newFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
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
      securityRange: [1, 5],
    };
    setFilters(resetFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    return () => {
      if (topsisTimerRef.current) {
        clearTimeout(topsisTimerRef.current);
      }
    };
  }, []);

  const handleTopsis = () => {
    if (topsisLoading) return;
    setTopsisLoading(true);
    topsisTimerRef.current = setTimeout(() => {
      navigate('/matrix-flow', { state: { initMatrix, rowIdsInMatrix, filters } });
      setTopsisLoading(false);
    }, 2000);
  };

  return (
    <div className="search-result-page">
      <div className="container">
        <div className="search-content">
          <Row gutter={24}>
            <Col xs={24} lg={7} xl={6}>
              <SidebarFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </Col>

            <Col xs={24} lg={17} xl={18}>
              <div className="results-section">
                <div className="results-header">
                  <div className="results-header-left">
                    <h2 className="results-title">
                      Tìm thấy <span className="text-primary">{totalRooms}</span> phòng trọ
                    </h2>
                    <p className="results-count">
                      Hiển thị {startIndex + 1}-{Math.min(endIndex, totalRooms)} của {totalRooms} kết quả
                    </p>
                    <p className="results-subtitle">Sắp xếp theo: Phù hợp nhất</p>
                  </div>
                  <Button
                    type="primary"
                    className="topsis-button"
                    loading={topsisLoading}
                    onClick={handleTopsis}
                  >
                    Xếp hạng TOPSIS
                  </Button>
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
                            animationDelay: `${index * 0.08}s`,
                          }}
                          className="result-item"
                        >
                          <RoomCardHorizontal room={room} isBest={currentPage === 1 && index === 0} />
                        </div>
                      ))}
                    </div>

                    <CustomPagination
                      current={currentPage}
                      total={totalRooms}
                      pageSize={pageSize}
                      onChange={handlePageChange}
                    />
                  </>
                ) : (
                  <Empty description="Không tìm thấy phòng trọ phù hợp" className="empty-results" />
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
