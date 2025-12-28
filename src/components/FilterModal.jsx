import { useEffect, useState } from 'react';
import { Modal, Slider, Select, Button, Divider } from 'antd';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllAreaTypesApi } from '../util/api';
import { ROOM_TYPE, ROOM_TYPE_LABELS } from '../util/constants';
import './FilterModal.css';

const DEFAULT_FILTERS = {
    priceRange: [1000000, 10000000],
    distanceRange: [0, 50],
    areaRange: [15, 50],
    roomType: undefined,
    areaTypeId: undefined,
    amenityRange: [1, 5],
    securityRange: [1, 5]
};

const roomTypeOptions = [
    { value: null, label: 'Tất cả' },
    { value: ROOM_TYPE.SINGLE, label: ROOM_TYPE_LABELS[ROOM_TYPE.SINGLE] },
    { value: ROOM_TYPE.DOUBLE, label: ROOM_TYPE_LABELS[ROOM_TYPE.DOUBLE] },
    { value: ROOM_TYPE.SHARED, label: ROOM_TYPE_LABELS[ROOM_TYPE.SHARED] },
];

const formatPrice = (value) => `${(value / 1000000).toFixed(1)}tr`;

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
    const [areaTypes, setAreaTypes] = useState([]);
    const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });

    useEffect(() => {
        setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
    }, [initialFilters]);

    useEffect(() => {
        fetchAreaTypes();
    }, []);

    const fetchAreaTypes = async () => {
        try {
            const response = await getAllAreaTypesApi();
            if (response.code === '00' && Array.isArray(response.data)) {
                const options = response.data.map((area) => ({
                    value: Number(area.id),
                    label: area.name
                }));
                setAreaTypes([{ value: null, label: 'Tất cả' }, ...options]);
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
        }
    };

    const handleUpdate = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleApply = () => {
        onApply?.(filters);
        onClose?.();
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
            width={640}
            closeIcon={null}
            className="filter-modal"
        >
            <div className="filter-modal-content">
                <div className="filter-section">
                    <label className="filter-label">Khoảng giá (VNĐ/tháng)</label>
                    <Slider
                        range
                        min={500000}
                        max={20000000}
                        step={500000}
                        value={filters.priceRange}
                        onChange={(value) => handleUpdate('priceRange', value)}
                        tooltip={{ formatter: formatPrice }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                    </div>
                </div>

                <Divider />

                <div className="filter-section">
                    <label className="filter-label">Khoảng cách đến trường (km)</label>
                    <Slider
                        range
                        min={0}
                        max={100}
                        step={5}
                        value={filters.distanceRange}
                        onChange={(value) => handleUpdate('distanceRange', value)}
                        marks={{ 0: '0km', 50: '50km', 100: '100km' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {filters.distanceRange[0]}km - {filters.distanceRange[1]}km
                    </div>
                </div>

                <Divider />

                <div className="filter-section">
                    <label className="filter-label">Diện tích (m²)</label>
                    <Slider
                        range
                        min={10}
                        max={100}
                        step={5}
                        value={filters.areaRange}
                        onChange={(value) => handleUpdate('areaRange', value)}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {filters.areaRange[0]}m² - {filters.areaRange[1]}m²
                    </div>
                </div>

                <Divider />

                <div className="filter-section">
                    <label className="filter-label">Loại phòng</label>
                    <Select
                        placeholder="Chọn loại phòng"
                        options={roomTypeOptions}
                        value={filters.roomType}
                        onChange={(value) => handleUpdate('roomType', value)}
                        className="filter-select"
                        allowClear
                    />
                </div>

                <Divider />

                {areaTypes.length > 0 && (
                    <div className="filter-section">
                        <label className="filter-label">Loại khu vực</label>
                        <Select
                            placeholder="Chọn khu vực"
                            options={areaTypes}
                            value={filters.areaTypeId}
                            onChange={(value) => handleUpdate('areaTypeId', value)}
                            className="filter-select"
                            allowClear
                        />
                    </div>
                )}

                {areaTypes.length > 0 && <Divider />}

                <div className="filter-section">
                    <label className="filter-label">Mức độ tiện nghi (1-5)</label>
                    <Slider
                        range
                        min={1}
                        max={5}
                        step={0.1}
                        value={filters.amenityRange}
                        onChange={(value) => handleUpdate('amenityRange', value)}
                        marks={{ 1: '1', 3: '3', 5: '5' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {filters.amenityRange[0].toFixed(1)} - {filters.amenityRange[1].toFixed(1)}
                    </div>
                </div>

                <Divider />

                <div className="filter-section">
                    <label className="filter-label">Mức độ an toàn (1-5)</label>
                    <Slider
                        range
                        min={1}
                        max={5}
                        step={0.1}
                        value={filters.securityRange}
                        onChange={(value) => handleUpdate('securityRange', value)}
                        marks={{ 1: '1', 3: '3', 5: '5' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {filters.securityRange[0].toFixed(1)} - {filters.securityRange[1].toFixed(1)}
                    </div>
                </div>

                <div className="filter-actions">
                    <Button onClick={handleReset} className="reset-button" icon={<ReloadOutlined />}>
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
