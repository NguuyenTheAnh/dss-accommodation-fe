import { Card, Tag } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, StarFilled, CrownFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './RoomCardHorizontal.css';

const buildImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('http')) return url;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${backendUrl}${url}`;
};

const RoomCardHorizontal = ({ room, isBest = false }) => {
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
        distance,
        amenities
    } = room || {};

    // Map new API fields to display values
    const displayImage = buildImageUrl(roomCoverImageUrl || image) || 'https://via.placeholder.com/400x250?text=Room+Image';
    const displayTitle = title || 'Phòng trọ cao cấp';
    const displayPrice = priceVnd ? priceVnd.toLocaleString() : (price || '3.000.000');
    const displayArea = areaSqm || area || '25';
    const displayLocation = address || location || 'Hà Nội';
    const displayRating = avgAmenity || avgSecurity || rating || 4.5;
    const displayDistance = distance || '';
    const displayAmenities = amenities || [];

    const handleCardClick = () => {
        navigate(`/rooms/${id}`, { state: { room } });
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
                        alt={displayTitle}
                        src={displayImage}
                        className="room-image"
                    />
                    <div className="rating-badge">
                        <StarFilled className="star-icon" />
                        <span>{typeof displayRating === 'number' ? displayRating.toFixed(1) : displayRating}</span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="room-info-section">
                    <h3 className="room-title">{displayTitle}</h3>

                    <div className="room-location">
                        <EnvironmentOutlined className="location-icon" />
                        <span>{displayLocation}</span>
                    </div>

                    {displayDistance && (
                        <div className="room-distance">
                            {displayDistance}
                        </div>
                    )}

                    {displayAmenities && displayAmenities.length > 0 && (
                        <div className="room-amenities">
                            {displayAmenities.slice(0, 4).map((amenity, index) => (
                                <Tag key={index} className="amenity-tag">
                                    {amenity}
                                </Tag>
                            ))}
                            {displayAmenities.length > 4 && (
                                <Tag className="amenity-tag more">+{displayAmenities.length - 4}</Tag>
                            )}
                        </div>
                    )}
                </div>

                {/* Price Section */}
                <div className="room-price-section">
                    <div className="price-info">
                        <DollarOutlined className="price-icon" />
                        <div className="price-details">
                            <span className="price-amount">{displayPrice}đ</span>
                            <span className="price-period">/tháng</span>
                        </div>
                    </div>

                    <div className="area-info">
                        <ExpandOutlined className="area-icon" />
                        <span className="area-text">{displayArea}m²</span>
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
