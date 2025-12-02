import { Button, Slider, Select, Rate, Divider } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import './SidebarFilter.css';

const SidebarFilter = ({ filters = {}, onFilterChange, onReset }) => {
    const roomTypes = [
        { value: 'single', label: 'Phòng đơn' },
        { value: 'double', label: 'Phòng đôi' },
        { value: 'apartment', label: 'Chung cư mini' },
        { value: 'house', label: 'Nhà nguyên căn' }
    ];

    const amenitiesList = [
        { value: 'wifi', label: 'WiFi' },
        { value: 'parking', label: 'Chỗ đậu xe' },
        { value: 'ac', label: 'Điều hòa' },
        { value: 'washing', label: 'Máy giặt' },
        { value: 'kitchen', label: 'Bếp' },
        { value: 'security', label: 'An ninh 24/7' }
    ];

    const formatPrice = (value) => {
        return `${(value / 1000000).toFixed(1)}tr`;
    };

    const handleFilterUpdate = (key, value) => {
        if (onFilterChange) {
            onFilterChange({ ...filters, [key]: value });
        }
    }; return (
        <div className="sidebar-filter">
            <div className="sidebar-filter-header">
                <h3 className="sidebar-filter-title">
                    <FilterOutlined /> Bộ lọc tìm kiếm
                </h3>
                <Button
                    type="text"
                    size="small"
                    onClick={onReset}
                    className="reset-button"
                    icon={<ReloadOutlined />}
                >
                    Đặt lại
                </Button>
            </div>

            <div className="filter-content">
                {/* Price Range */}
                <div className="filter-section">
                    <label className="filter-label">Khoảng giá (VNĐ/tháng)</label>
                    <Slider
                        range
                        min={500000}
                        max={20000000}
                        step={500000}
                        value={filters.priceRange || [1000000, 10000000]}
                        onChange={(value) => handleFilterUpdate('priceRange', value)}
                        tooltip={{ formatter: formatPrice }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {formatPrice((filters.priceRange || [1000000, 10000000])[0])} - {formatPrice((filters.priceRange || [1000000, 10000000])[1])}
                    </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Distance */}
                <div className="filter-section">
                    <label className="filter-label">Khoảng cách đến trường (km)</label>
                    <Slider
                        min={0}
                        max={10}
                        step={0.5}
                        value={filters.distance || 5}
                        onChange={(value) => handleFilterUpdate('distance', value)}
                        marks={{ 0: '0km', 5: '5km', 10: '10km' }}
                        className="custom-slider"
                    />
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Area Range */}
                <div className="filter-section">
                    <label className="filter-label">Diện tích (m²)</label>
                    <Slider
                        range
                        min={10}
                        max={100}
                        step={5}
                        value={filters.areaRange || [15, 50]}
                        onChange={(value) => handleFilterUpdate('areaRange', value)}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {(filters.areaRange || [15, 50])[0]}m² - {(filters.areaRange || [15, 50])[1]}m²
                    </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Rating */}
                <div className="filter-section">
                    <label className="filter-label">Đánh giá tối thiểu</label>
                    <Rate
                        value={filters.rating || 0}
                        onChange={(value) => handleFilterUpdate('rating', value)}
                        className="custom-rate"
                    />
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Room Type */}
                <div className="filter-section">
                    <label className="filter-label">Loại phòng</label>
                    <Select
                        placeholder="Chọn loại phòng"
                        options={roomTypes}
                        value={filters.roomType}
                        onChange={(value) => handleFilterUpdate('roomType', value)}
                        className="filter-select"
                        allowClear
                        style={{ width: '100%' }}
                    />
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Amenities */}
                <div className="filter-section">
                    <label className="filter-label">Tiện nghi</label>
                    <Select
                        mode="multiple"
                        placeholder="Chọn tiện nghi"
                        options={amenitiesList}
                        value={filters.amenities || []}
                        onChange={(value) => handleFilterUpdate('amenities', value)}
                        className="filter-select"
                        maxTagCount="responsive"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SidebarFilter;
