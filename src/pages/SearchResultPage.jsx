import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Empty, Spin, message, Button } from 'antd';
import RoomCardHorizontal from '../components/RoomCardHorizontal';
import SidebarFilter from '../components/SidebarFilter';
import CustomPagination from '../components/CustomPagination';
import { searchRoomsApi, getAllAreaTypesApi } from '../util/api';
import { ROOM_TYPE } from '../util/constants';
import './SearchResultPage.css';

const DEFAULT_PRICE_RANGE = [1000000, 10000000];
const DEFAULT_DISTANCE_RANGE = [0, 5];
const DEFAULT_AREA_RANGE = [15, 50];
const DEFAULT_AMENITY_RANGE = [1, 5];
const DEFAULT_SECURITY_RANGE = [1, 5];
const ALL_ROOM_TYPES = Object.values(ROOM_TYPE);
const UI_FILTER_STORAGE_KEY = 'roomsUiFilters';

const createDefaultFilters = () => {
  let schoolIdFromCache;
  try {
    const raw = localStorage.getItem('selectedSchoolId');
    schoolIdFromCache = raw ? Number(raw) : undefined;
  } catch {
    schoolIdFromCache = undefined;
  }

  return {
    schoolId: Number.isFinite(schoolIdFromCache) ? schoolIdFromCache : undefined,
    priceRange: [...DEFAULT_PRICE_RANGE],
    distanceRange: [...DEFAULT_DISTANCE_RANGE],
    areaRange: [...DEFAULT_AREA_RANGE],
    roomType: undefined,
    areaTypeId: undefined,
    amenityRange: [...DEFAULT_AMENITY_RANGE],
    securityRange: [...DEFAULT_SECURITY_RANGE],
  };
};

const sanitizeUiFilters = (input = {}) => {
  const next = { ...input };
  const toMaybeNumber = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : val;
  };

  if (next.schoolId !== undefined && next.schoolId !== null) {
    next.schoolId = toMaybeNumber(next.schoolId);
  }
  if (next.areaTypeId !== undefined && next.areaTypeId !== null) {
    next.areaTypeId = toMaybeNumber(next.areaTypeId);
  }
  if (Array.isArray(next.priceRange) && next.priceRange.length === 2) {
    next.priceRange = [toMaybeNumber(next.priceRange[0]), toMaybeNumber(next.priceRange[1])];
  }
  if (Array.isArray(next.distanceRange) && next.distanceRange.length === 2) {
    next.distanceRange = [toMaybeNumber(next.distanceRange[0]), toMaybeNumber(next.distanceRange[1])];
  }
  if (Array.isArray(next.areaRange) && next.areaRange.length === 2) {
    next.areaRange = [toMaybeNumber(next.areaRange[0]), toMaybeNumber(next.areaRange[1])];
  }
  if (next.roomType === '') {
    next.roomType = undefined;
  }
  return next;
};

const readStoredFilters = () => {
  try {
    const raw = localStorage.getItem(UI_FILTER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistFilters = (filters) => {
  try {
    localStorage.setItem(UI_FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
};

const toNumberOr = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeFiltersForApi = (uiFilters = {}, allRoomTypes = [], allAreaTypeIds = []) => {
  const {
    schoolId,
    priceRange = DEFAULT_PRICE_RANGE,
    distanceRange = DEFAULT_DISTANCE_RANGE,
    areaRange = DEFAULT_AREA_RANGE,
    roomType,
    areaTypeId,
    amenityRange = DEFAULT_AMENITY_RANGE,
    securityRange = DEFAULT_SECURITY_RANGE,
  } = uiFilters;

  const [minPrice, maxPrice] = priceRange.length === 2 ? priceRange : DEFAULT_PRICE_RANGE;
  const [minDistance, maxDistance] = distanceRange.length === 2 ? distanceRange : DEFAULT_DISTANCE_RANGE;
  const [minArea, maxArea] = areaRange.length === 2 ? areaRange : DEFAULT_AREA_RANGE;
  const [minAmenity, maxAmenity] = amenityRange.length === 2 ? amenityRange : DEFAULT_AMENITY_RANGE;
  const [minSecurity, maxSecurity] = securityRange.length === 2 ? securityRange : DEFAULT_SECURITY_RANGE;

  const toMeters = (value) => toNumberOr(value, 0) * 1000;
  const parsedSchoolId = schoolId === undefined || schoolId === null ? undefined : Number(schoolId);

  const allRoomTypesFallback = Array.isArray(allRoomTypes) && allRoomTypes.length ? allRoomTypes : [];
  const allAreaTypeIdsFallback = Array.isArray(allAreaTypeIds) && allAreaTypeIds.length ? allAreaTypeIds : [];

  return {
    schoolId: Number.isFinite(parsedSchoolId) ? parsedSchoolId : undefined,
    fromPrice: toNumberOr(minPrice, DEFAULT_PRICE_RANGE[0]),
    toPrice: toNumberOr(maxPrice, DEFAULT_PRICE_RANGE[1]),
    fromDistance: toMeters(minDistance),
    toDistance: toMeters(maxDistance),
    fromArea: toNumberOr(minArea, DEFAULT_AREA_RANGE[0]),
    toArea: toNumberOr(maxArea, DEFAULT_AREA_RANGE[1]),
    fromSecurityPoints: toNumberOr(minSecurity, DEFAULT_SECURITY_RANGE[0]),
    toSecurityPoints: toNumberOr(maxSecurity, DEFAULT_SECURITY_RANGE[1]),
    fromAmenityPoints: toNumberOr(minAmenity, DEFAULT_AMENITY_RANGE[0]),
    toAmenityPoints: toNumberOr(maxAmenity, DEFAULT_AMENITY_RANGE[1]),
    areaTypeIds:
      areaTypeId === null || areaTypeId === undefined
        ? allAreaTypeIdsFallback
        : [areaTypeId],
    roomTypes:
      roomType === null || roomType === undefined
        ? allRoomTypesFallback
        : [roomType],
  };
};

const SearchResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const filtersFromNav = useMemo(() => sanitizeUiFilters(location.state?.filters || {}), [location.state]);

  const [filters, setFilters] = useState(() =>
    sanitizeUiFilters({
      ...createDefaultFilters(),
      ...readStoredFilters(),
      ...filtersFromNav,
    })
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [currentRooms, setCurrentRooms] = useState([]);
  const [initMatrix, setInitMatrix] = useState([]);
  const [rowIdsInMatrix, setRowIdsInMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topsisLoading, setTopsisLoading] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState(() =>
    normalizeFiltersForApi(createDefaultFilters(), ALL_ROOM_TYPES, [])
  );
  const [allAreaTypeIds, setAllAreaTypeIds] = useState([]);
  const topsisTimerRef = useRef(null);
  const pageSize = 10;

  useEffect(() => {
    // If user navigates with pre-filled filters (e.g., from Home filter modal), hydrate them
    setFilters((prev) => {
      const next = { ...createDefaultFilters(), ...prev, ...filtersFromNav };
      persistFilters(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersFromNav]);

  useEffect(() => {
    const fetchAreaTypes = async () => {
      try {
        const res = await getAllAreaTypesApi();
        if (res.code === '00' && Array.isArray(res.data)) {
          const ids = res.data.map((item) => item.id).filter((id) => id !== undefined && id !== null);
          setAllAreaTypeIds(ids);
        }
      } catch (err) {
        console.warn('Cannot fetch area types for filters', err);
      }
    };
    fetchAreaTypes();
  }, []);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, allAreaTypeIds]);

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const normalizedFilter = normalizeFiltersForApi(filters, ALL_ROOM_TYPES, allAreaTypeIds);
      const searchParams = {
        pageNumber: currentPage - 1,
        pageSize,
        ...normalizedFilter,
      };

      setAppliedFilter(normalizedFilter);
      try {
        localStorage.setItem('roomsFilterPayload', JSON.stringify(normalizedFilter));
      } catch (e) {
        console.warn('Cannot cache search filter', e);
      }

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
    persistFilters(newFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = createDefaultFilters();
    setFilters(resetFilters);
    persistFilters(resetFilters);
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
    const decisionFilter =
      appliedFilter || normalizeFiltersForApi(filters, ALL_ROOM_TYPES, allAreaTypeIds);
    setTopsisLoading(true);
    topsisTimerRef.current = setTimeout(() => {
      navigate('/matrix-flow', { state: { initMatrix, rowIdsInMatrix, filters: decisionFilter } });
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
                          <RoomCardHorizontal room={room} />
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
