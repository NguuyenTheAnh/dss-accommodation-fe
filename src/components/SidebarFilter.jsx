import { Tag, Button } from 'antd';
import { CloseCircleOutlined, FilterOutlined } from '@ant-design/icons';
import './SidebarFilter.css';

const SidebarFilter = ({ filters = {}, onRemoveFilter, onClearAll, onOpenModal }) => {
    const hasFilters = Object.keys(filters).some(key => {
        const value = filters[key];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== 0;
    });

    const formatPrice = (value) => {
        return `${(value / 1000000).toFixed(1)}tr`;
    };

    const renderFilterTags = () => {
        const tags = [];

        // Price Range
        if (filters.priceRange && (filters.priceRange[0] !== 1000000 || filters.priceRange[1] !== 10000000)) {
            tags.push(
                <Tag
                    key="price"
                    closable
                    onClose={() => onRemoveFilter('priceRange')}
                    className="filter-tag"
                >
                    Giá: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                </Tag>
            );
        }

        // Distance
        if (filters.distance && filters.distance !== 5) {
            tags.push(
                <Tag
                    key="distance"
                    closable
                    onClose={() => onRemoveFilter('distance')}
                    className="filter-tag"
                >
                    Khoảng cách: ≤ {filters.distance}km
                </Tag>
            );
        }

        // Area Range
        if (filters.areaRange && (filters.areaRange[0] !== 15 || filters.areaRange[1] !== 50)) {
            tags.push(
                <Tag
                    key="area"
                    closable
                    onClose={() => onRemoveFilter('areaRange')}
                    className="filter-tag"
                >
                    Diện tích: {filters.areaRange[0]}m² - {filters.areaRange[1]}m²
                </Tag>
            );
        }

        // Rating
        if (filters.rating && filters.rating > 0) {
            tags.push(
                <Tag
                    key="rating"
                    closable
                    onClose={() => onRemoveFilter('rating')}
                    className="filter-tag"
                >
                    Đánh giá: ≥ {filters.rating}⭐
                </Tag>
            );
        }

        // Room Type
        if (filters.roomType) {
            const roomTypeLabels = {
                'single': 'Phòng đơn',
                'double': 'Phòng đôi',
                'apartment': 'Chung cư mini',
                'house': 'Nhà nguyên căn'
            };
            tags.push(
                <Tag
                    key="roomType"
                    closable
                    onClose={() => onRemoveFilter('roomType')}
                    className="filter-tag"
                >
                    {roomTypeLabels[filters.roomType]}
                </Tag>
            );
        }

        // Amenities
        if (filters.amenities && filters.amenities.length > 0) {
            const amenityLabels = {
                'wifi': 'WiFi',
                'parking': 'Chỗ đậu xe',
                'ac': 'Điều hòa',
                'washing': 'Máy giặt',
                'kitchen': 'Bếp',
                'security': 'An ninh 24/7'
            };

            filters.amenities.forEach(amenity => {
                tags.push(
                    <Tag
                        key={`amenity-${amenity}`}
                        closable
                        onClose={() => {
                            const newAmenities = filters.amenities.filter(a => a !== amenity);
                            onRemoveFilter('amenities', newAmenities);
                        }}
                        className="filter-tag"
                    >
                        {amenityLabels[amenity]}
                    </Tag>
                );
            });
        }

        return tags;
    };

    return (
        <div className="sidebar-filter">
            <div className="sidebar-filter-header">
                <h3 className="sidebar-filter-title">
                    <FilterOutlined /> Bộ lọc
                </h3>
                {hasFilters && (
                    <Button
                        type="text"
                        size="small"
                        onClick={onClearAll}
                        className="clear-all-button"
                        icon={<CloseCircleOutlined />}
                    >
                        Xóa tất cả
                    </Button>
                )}
            </div>

            <div className="filter-tags-container">
                {hasFilters ? (
                    <>
                        {renderFilterTags()}
                        <Button
                            block
                            onClick={onOpenModal}
                            className="edit-filter-button"
                        >
                            Chỉnh sửa bộ lọc
                        </Button>
                    </>
                ) : (
                    <div className="no-filters">
                        <p>Chưa có bộ lọc nào được áp dụng</p>
                        <Button
                            type="primary"
                            block
                            onClick={onOpenModal}
                            className="add-filter-button"
                        >
                            Thêm bộ lọc
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarFilter;
