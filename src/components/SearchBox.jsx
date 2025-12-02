import { useState } from 'react';
import { Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import './SearchBox.css';

const SearchBox = ({ onSearch, onFilterClick, variant = 'hero' }) => {
    const [selectedArea, setSelectedArea] = useState(undefined);

    const areas = [
        { value: 'hoan-kiem', label: 'Hoàn Kiếm' },
        { value: 'ba-dinh', label: 'Ba Đình' },
        { value: 'dong-da', label: 'Đống Đa' },
        { value: 'hai-ba-trung', label: 'Hai Bà Trưng' },
        { value: 'cau-giay', label: 'Cầu Giấy' },
        { value: 'thanh-xuan', label: 'Thanh Xuân' },
        { value: 'hoang-mai', label: 'Hoàng Mai' },
        { value: 'long-bien', label: 'Long Biên' },
    ];

    const handleSearch = () => {
        if (onSearch) {
            onSearch({ area: selectedArea });
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
