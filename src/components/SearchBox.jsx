import { useState, useEffect } from 'react';
import { Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getAllAreaTypesApi, getAllSchoolsApi } from '../util/api';
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

    const fetchSchools = async (keyword = '') => {
        try {
            const response = await getAllSchoolsApi(keyword);

            if (response.code === '00' && Array.isArray(response.data)) {
                const schoolOptions = response.data.map((school) => ({
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
            const response = await getAllAreaTypesApi();

            if (response.code === '00' && Array.isArray(response.data)) {
                const areaOptions = response.data.map((area) => ({
                    value: area.id,
                    label: area.name
                }));
                setAreas(areaOptions);
            } else {
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
        { value: 3, label: 'Ngoại thành' }
    ];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({
                school: selectedSchool,
                area: selectedArea
            });
        }
    };

    useEffect(() => {
        if (selectedSchool) {
            try {
                localStorage.setItem('selectedSchoolId', selectedSchool);
            } catch (e) {
                console.warn('Cannot persist selected school', e);
            }
        }
    }, [selectedSchool]);

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
                    onSearch={fetchSchools}
                    onDropdownVisibleChange={(open) => {
                        if (open) fetchSchools('');
                    }}
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
