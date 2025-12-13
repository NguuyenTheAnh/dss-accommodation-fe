import { useState, useEffect } from 'react';
import { Select, Button, message } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getAllSchoolsApi, saveDistanceApi } from '../util/api';
import './SearchBox.css';

const SearchBox = ({ onSearch, onFilterClick, variant = 'hero' }) => {
    const [selectedSchool, setSelectedSchool] = useState();
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        fetchSchools();
        // hydrate selected school if cached
        try {
            const saved = localStorage.getItem('selectedSchoolId');
            if (saved) {
                setSelectedSchool(Number(saved));
            }
        } catch (e) {
            console.warn('Cannot read selectedSchoolId', e);
        }
    }, []);

    const fetchSchools = async (keyword = '') => {
        try {
            const response = await getAllSchoolsApi(keyword);
            if (response.code === '00' && Array.isArray(response.data)) {
                const schoolOptions = response.data.map((school) => ({
                    value: Number(school.id),
                    label: school.name
                }));
                setSchools(schoolOptions);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleSearch = () => {
        if (!selectedSchool) {
            message.warning('Vui lòng chọn trường trước khi tìm kiếm');
            return;
        }
        if (onSearch) {
            onSearch({
                school: selectedSchool
            });
        }
    };

    useEffect(() => {
        const persistAndSave = async () => {
            if (!selectedSchool) return;
            try {
                localStorage.setItem('selectedSchoolId', selectedSchool);
                const res = await saveDistanceApi(Number(selectedSchool));
                if (res.code !== '00') {
                    message.warning(res.message || 'Không lưu được khoảng cách');
                }
            } catch (e) {
                console.warn('Cannot persist selected school', e);
            }
        };
        persistAndSave();
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
                    placeholder="Chọn trường (bắt buộc)"
                    size="large"
                    options={schools}
                    value={selectedSchool}
                    onChange={setSelectedSchool}
                    onSearch={fetchSchools}
                    onDropdownVisibleChange={(open) => {
                        if (open) fetchSchools('');
                    }}
                    onKeyPress={handleKeyPress}
                    showSearch
                    allowClear={false}
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
