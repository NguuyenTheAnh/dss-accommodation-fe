import { Card } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RoomCard.css';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const {
        id,
        roomCoverImageUrl,
        title,
        priceVnd,
        areaSqm,
        address,
        avgAmenity,
        avgSecurity,
        // Legacy fields for fallback
        image,
        price,
        area,
        location,
        rating,
        distance
    } = room || {};

    // Map new API fields to display values
    const displayImage = roomCoverImageUrl || image || 'https://via.placeholder.com/300x200?text=Room+Image';
    const displayTitle = title || 'Phòng trọ cao cấp';
    const displayPrice = priceVnd ? priceVnd.toLocaleString() : (price || '3.000.000');
    const displayArea = areaSqm || area || '25';
    const displayLocation = address || location || 'Hà Nội';
    const displayRating = avgAmenity || avgSecurity || rating || 4.5;
    const displayDistance = distance || '';

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
                        alt={displayTitle}
                        src={displayImage}
                        className="room-card-image"
                    />
                    <div className="room-card-badge">
                        <StarFilled className="star-icon" />
                        <span>{typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating}</span>
                    </div>
                </div>
            }
            onClick={handleCardClick}
        >
            <div className="room-card-content">
                <h3 className="room-card-title">{displayTitle}</h3>

                <div className="room-card-info">
                    <div className="info-item price-highlight">
                        <DollarOutlined className="info-icon" />
                        <span className="price-text">{displayPrice}đ/tháng</span>
                    </div>

                    <div className="info-item">
                        <ExpandOutlined className="info-icon" />
                        <span>{displayArea}m²</span>
                    </div>
                </div>

                <div className="room-card-location">
                    <EnvironmentOutlined className="location-icon" />
                    <span className="location-text">{displayLocation}</span>
                </div>

                {displayDistance && (
                    <div className="room-card-distance">
                        {displayDistance}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default RoomCard;
