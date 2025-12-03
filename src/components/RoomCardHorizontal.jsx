import { Card, Tag } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, StarFilled, CrownFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RoomCardHorizontal.css';

const RoomCardHorizontal = ({ room, isBest = false }) => {
    const navigate = useNavigate();
    const {
        id,
        image = 'https://via.placeholder.com/400x250?text=Room+Image',
        title = 'Phòng trọ cao cấp',
        price = '3.000.000',
        area = '25',
        location = 'Cầu Giấy, Hà Nội',
        rating = 4.5,
        distance = '1.2km đến trường',
        amenities = []
    } = room || {};

    const handleCardClick = () => {
        navigate(`/rooms/${id}`);
    };

    return (
        <Card
            hoverable
            className={`room-card-horizontal ${isBest ? 'best-room' : ''}`}
            onClick={handleCardClick}
        >
            {isBest && (
                <div className="best-badge">
                    <CrownFilled className="crown-icon" />
                    <span>Best Choice</span>
                </div>
            )}

            <div className="room-card-horizontal-content">
                {/* Image Section */}
                <div className="room-image-section">
                    <img
                        alt={title}
                        src={image}
                        className="room-image"
                    />
                    <div className="rating-badge">
                        <StarFilled className="star-icon" />
                        <span>{rating}</span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="room-info-section">
                    <h3 className="room-title">{title}</h3>

                    <div className="room-location">
                        <EnvironmentOutlined className="location-icon" />
                        <span>{location}</span>
                    </div>

                    {distance && (
                        <div className="room-distance">
                            {distance}
                        </div>
                    )}

                    {amenities && amenities.length > 0 && (
                        <div className="room-amenities">
                            {amenities.slice(0, 4).map((amenity, index) => (
                                <Tag key={index} className="amenity-tag">
                                    {amenity}
                                </Tag>
                            ))}
                            {amenities.length > 4 && (
                                <Tag className="amenity-tag more">+{amenities.length - 4}</Tag>
                            )}
                        </div>
                    )}
                </div>

                {/* Price Section */}
                <div className="room-price-section">
                    <div className="price-info">
                        <DollarOutlined className="price-icon" />
                        <div className="price-details">
                            <span className="price-amount">{price}đ</span>
                            <span className="price-period">/tháng</span>
                        </div>
                    </div>

                    <div className="area-info">
                        <ExpandOutlined className="area-icon" />
                        <span className="area-text">{area}m²</span>
                    </div>

                    <button className="view-details-btn">
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default RoomCardHorizontal;
