import { Spin } from 'antd';
import './TOPSISResultPage.css';

const TOPSISResultPage = () => {
  return (
    <div className="topsis-result-page">
      <div className="container">
        <div className="flow-card">
          <h1>Kết quả xếp hạng TOPSIS</h1>
          <p>Nội dung sẽ được cập nhật theo yêu cầu tiếp theo.</p>
          <Spin size="large" />
        </div>
      </div>
    </div>
  );
};

export default TOPSISResultPage;
