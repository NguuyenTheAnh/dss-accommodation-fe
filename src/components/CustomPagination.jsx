import { Pagination as AntPagination } from 'antd';
import './CustomPagination.css';

const CustomPagination = ({ current, total, pageSize = 12, onChange }) => {
    return (
        <div className="custom-pagination-wrapper">
            <AntPagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phòng`}
                className="custom-pagination"
            />
        </div>
    );
};

export default CustomPagination;
