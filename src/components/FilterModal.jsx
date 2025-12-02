import { useState } from 'react';
import { Modal, Slider, Select, Rate, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './FilterModal.css';

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        priceRange: initialFilters.priceRange || [1000000, 10000000],
        distance: initialFilters.distance || 5,
        areaRange: initialFilters.areaRange || [15, 50],
        rating: initialFilters.rating || 0,
        roomType: initialFilters.roomType || undefined,
        amenities: initialFilters.amenities || []
    });

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

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            priceRange: [1000000, 10000000],
            distance: 5,
            areaRange: [15, 50],
            rating: 0,
            roomType: undefined,
            amenities: []
        };
        setFilters(resetFilters);
    };

    const formatPrice = (value) => {
        return `${(value / 1000000).toFixed(1)}tr`;
    };

    return (
        <Modal
            title={
                <div className="filter-modal-header">
                    <h3>Bộ lọc tìm kiếm</h3>
                    <CloseOutlined onClick={onClose} className="close-icon" />
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            closeIcon={null}
            className="filter-modal"
        >
            <div className="filter-modal-content">
                {/* Price Range */}
                <div className="filter-section">
                    <label className="filter-label">Khoảng giá (VNĐ/tháng)</label>
                    <Slider
                        range
                        min={500000}
                        max={20000000}
                        step={500000}
                        value={filters.priceRange}
                        onChange={(value) => setFilters({ ...filters, priceRange: value })}
                        tooltip={{ formatter: formatPrice }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                    </div>
                </div>

                {/* Distance */}
                <div className="filter-section">
                    <label className="filter-label">Khoảng cách đến trường (km)</label>
                    <Slider
                        min={0}
                        max={10}
                        step={0.5}
                        value={filters.distance}
                        onChange={(value) => setFilters({ ...filters, distance: value })}
                        marks={{ 0: '0km', 5: '5km', 10: '10km' }}
                        className="custom-slider"
                    />
                </div>

                {/* Area Range */}
                <div className="filter-section">
                    <label className="filter-label">Diện tích (m²)</label>
                    <Slider
                        range
                        min={10}
                        max={100}
                        step={5}
                        value={filters.areaRange}
                        onChange={(value) => setFilters({ ...filters, areaRange: value })}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {filters.areaRange[0]}m² - {filters.areaRange[1]}m²
                    </div>
                </div>

                {/* Rating */}
                <div className="filter-section">
                    <label className="filter-label">Đánh giá tối thiểu</label>
                    <Rate
                        value={filters.rating}
                        onChange={(value) => setFilters({ ...filters, rating: value })}
                        className="custom-rate"
                    />
                </div>

                {/* Room Type */}
                <div className="filter-section">
                    <label className="filter-label">Loại phòng</label>
                    <Select
                        placeholder="Chọn loại phòng"
                        options={roomTypes}
                        value={filters.roomType}
                        onChange={(value) => setFilters({ ...filters, roomType: value })}
                        className="filter-select"
                        allowClear
                    />
                </div>

                {/* Amenities */}
                <div className="filter-section">
                    <label className="filter-label">Tiện nghi</label>
                    <Select
                        mode="multiple"
                        placeholder="Chọn tiện nghi"
                        options={amenitiesList}
                        value={filters.amenities}
                        onChange={(value) => setFilters({ ...filters, amenities: value })}
                        className="filter-select"
                        maxTagCount="responsive"
                    />
                </div>

                {/* Action Buttons */}
                <div className="filter-actions">
                    <Button onClick={handleReset} className="reset-button">
                        Đặt lại
                    </Button>
                    <Button type="primary" onClick={handleApply} className="apply-button">
                        Áp dụng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default FilterModal;
