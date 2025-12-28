import { useState, useEffect } from 'react';
import { Button, Slider, Select, Rate, Divider } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllAreaTypesApi, getAllSchoolsApi } from '../util/api';
import { ROOM_TYPE, ROOM_TYPE_LABELS } from '../util/constants';
import './SidebarFilter.css';

const SidebarFilter = ({ filters = {}, onFilterChange, onReset }) => {
    const [areaTypes, setAreaTypes] = useState([]);
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        fetchAreaTypes();
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await getAllSchoolsApi();

            if (response.code === '00' && response.data) {
                const schoolOptions = response.data.map(school => ({
                    value: Number(school.id),
                    label: school.name
                }));
                setSchools(schoolOptions);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchAreaTypes = async () => {
        try {
            const response = await getAllAreaTypesApi();

            if (response.code === '00' && response.data) {
                const areaOptions = response.data.map(area => ({
                    value: Number(area.id),
                    label: area.name
                }));
                setAreaTypes([{ value: null, label: 'Tất cả' }, ...areaOptions]);
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
        }
    };

    const roomTypes = [
        { value: null, label: 'Tất cả' },
        { value: ROOM_TYPE.SINGLE, label: ROOM_TYPE_LABELS[ROOM_TYPE.SINGLE] },
        { value: ROOM_TYPE.DOUBLE, label: ROOM_TYPE_LABELS[ROOM_TYPE.DOUBLE] },
        { value: ROOM_TYPE.SHARED, label: ROOM_TYPE_LABELS[ROOM_TYPE.SHARED] }
    ];

    // const amenitiesList = [
    //     { value: 'wifi', label: 'WiFi' },
    //     { value: 'parking', label: 'Chỗ đậu xe' },
    //     { value: 'ac', label: 'Điều hòa' },
    //     { value: 'washing', label: 'Máy giặt' },
    //     { value: 'kitchen', label: 'Bếp' },
    //     { value: 'security', label: 'An ninh 24/7' }
    // ];

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
                {/* School Selection */}
                {schools.length > 0 && (
                    <>
                        <div className="filter-section">
                            <label className="filter-label">Trường học</label>
                            <Select
                                placeholder="Chọn trường"
                                options={schools}
                                value={filters.schoolId}
                                onChange={(value) => handleFilterUpdate('schoolId', value)}
                                className="filter-select"
                                allowClear
                                style={{ width: '100%' }}
                            />
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                    </>
                )}

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

                {/* Distance Range */}
                <div className="filter-section">
                    <label className="filter-label">Khoảng cách đến trường (km)</label>
                    <Slider
                        range
                        min={0}
                        max={100}
                        step={5}
                        value={filters.distanceRange || [0, 50]}
                        onChange={(value) => handleFilterUpdate('distanceRange', value)}
                        marks={{ 0: '0km', 50: '50km', 100: '100km' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {(filters.distanceRange || [0, 50])[0]}km - {(filters.distanceRange || [0, 50])[1]}km
                    </div>
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

                {/* Area Type */}
                {areaTypes.length > 0 && (
                    <>
                        <div className="filter-section">
                            <label className="filter-label">Loại khu vực</label>
                            <Select
                                placeholder="Chọn khu vực"
                                options={areaTypes}
                                value={filters.areaTypeId}
                                onChange={(value) => handleFilterUpdate('areaTypeId', value)}
                                className="filter-select"
                                allowClear
                                style={{ width: '100%' }}
                            />
                        </div>
                        <Divider style={{ margin: '16px 0' }} />
                    </>
                )}

                {/* Amenity Score Range */}
                <div className="filter-section">
                    <label className="filter-label">Mức độ tiện nghi (1-5)</label>
                    <Slider
                        range
                        min={1}
                        max={5}
                        step={0.1}
                        value={filters.amenityRange || [1, 5]}
                        onChange={(value) => handleFilterUpdate('amenityRange', value)}
                        marks={{ 1: '1', 3: '3', 5: '5' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {(filters.amenityRange || [1, 5])[0].toFixed(1)} - {(filters.amenityRange || [1, 5])[1].toFixed(1)}
                    </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Security Score Range */}
                <div className="filter-section">
                    <label className="filter-label">Mức độ an toàn (1-5)</label>
                    <Slider
                        range
                        min={1}
                        max={5}
                        step={0.1}
                        value={filters.securityRange || [1, 5]}
                        onChange={(value) => handleFilterUpdate('securityRange', value)}
                        marks={{ 1: '1', 3: '3', 5: '5' }}
                        className="custom-slider"
                    />
                    <div className="range-display">
                        {(filters.securityRange || [1, 5])[0].toFixed(1)} - {(filters.securityRange || [1, 5])[1].toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarFilter;
