import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import './MatrixFlowPage.css';

const MatrixFlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/topsis-result', { state: location.state });
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate, location.state]);

  return (
    <div className="matrix-flow-page">
      <div className="container">
        <div className="flow-card">
          <h1>Chuẩn bị dữ liệu TOPSIS</h1>
          <p>Đang chuyển sang bước tính TOPSIS (5s)...</p>
          <Spin size="large" />
        </div>
      </div>
    </div>
  );
};

export default MatrixFlowPage;
