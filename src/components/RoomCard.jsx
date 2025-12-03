import { Card } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RoomCard.css';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const {
        id,
        image = 'https://via.placeholder.com/300x200?text=Room+Image',
        title = 'Phòng trọ cao cấp',
        price = '3.000.000',
        area = '25',
        location = 'Cầu Giấy, Hà Nội',
        rating = 4.5,
        distance = '1.2km đến trường'
    } = room || {};

    const handleCardClick = () => {
        navigate(`/rooms/${id}`);
    };

    return (
        <Card
            hoverable
            className="room-card"
            cover={
                <div className="room-card-image-wrapper">
                    <img
                        alt={title}
                        src={image}
                        className="room-card-image"
                    />
                    <div className="room-card-badge">
                        <StarFilled className="star-icon" />
                        <span>{rating}</span>
                    </div>
                </div>
            }
            onClick={handleCardClick}
        >
            <div className="room-card-content">
                <h3 className="room-card-title">{title}</h3>

                <div className="room-card-info">
                    <div className="info-item price-highlight">
                        <DollarOutlined className="info-icon" />
                        <span className="price-text">{price}đ/tháng</span>
                    </div>

                    <div className="info-item">
                        <ExpandOutlined className="info-icon" />
                        <span>{area}m²</span>
                    </div>
                </div>

                <div className="room-card-location">
                    <EnvironmentOutlined className="location-icon" />
                    <span className="location-text">{location}</span>
                </div>

                {distance && (
                    <div className="room-card-distance">
                        {distance}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default RoomCard;
