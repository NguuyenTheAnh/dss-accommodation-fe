import { useState, useEffect } from 'react';
import { Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getAllAreaTypesApi } from '../util/api';
import './SearchBox.css';

const SearchBox = ({ onSearch, onFilterClick, variant = 'hero' }) => {
    const [selectedSchool, setSelectedSchool] = useState(undefined);
    const [selectedArea, setSelectedArea] = useState(undefined);
    const [schools, setSchools] = useState([]);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        fetchSchools();
        fetchAreaTypes();
    }, []);

    const fetchSchools = async () => {
        try {
            // MOCK API - Success case với 1 trường HUST
            const response = {
                code: '00',
                message: null,
                data: [
                    { id: 1, name: 'HUST - Đại học Bách Khoa Hà Nội' }
                ]
            };

            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.code === '00' && response.data) {
                const schoolOptions = response.data.map(school => ({
                    value: school.id,
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
            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: [
                    { id: 1, name: 'G\u1ea7n tr\u01b0\u1eddng' },
                    { id: 2, name: 'Trung t\u00e2m' },
                    { id: 3, name: 'Ngo\u1ea1i th\u00e0nh' }
                ]
            };

            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.code === '00' && response.data) {
                // Map API response to Select options format
                const areaOptions = response.data.map(area => ({
                    value: area.id,
                    label: area.name
                }));
                setAreas(areaOptions);
            } else {
                // Fallback to default areas
                setAreas(getDefaultAreas());
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
            setAreas(getDefaultAreas());
        }
    };

    const getDefaultAreas = () => [
        { value: 1, label: 'Gần trường' },
        { value: 2, label: 'Trung tâm' },
        { value: 3, label: 'Ngoại thành' },
    ];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({
                school: selectedSchool,
                area: selectedArea
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={`search-box ${variant}`}>
            <div className="search-box-content">
                <Select
                    className="school-select"
                    placeholder="Chọn trường"
                    size="large"
                    options={schools}
                    value={selectedSchool}
                    onChange={setSelectedSchool}
                    onKeyPress={handleKeyPress}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />

                <Select
                    className="area-select"
                    placeholder="Chọn khu vực"
                    size="large"
                    options={areas}
                    value={selectedArea}
                    onChange={setSelectedArea}
                    onKeyPress={handleKeyPress}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />

                <Button
                    className="filter-button"
                    size="large"
                    icon={<FilterOutlined />}
                    onClick={onFilterClick}
                >
                    Bộ lọc
                </Button>

                <Button
                    className="search-button"
                    type="primary"
                    size="large"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                >
                    Tìm kiếm
                </Button>
            </div>
        </div>
    );
};

export default SearchBox;
