import { Image, Tag, Rate, Divider } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, HomeOutlined } from '@ant-design/icons';
import './RoomInfoSection.css';

const RoomInfoSection = ({ roomData }) => {
    const {
        title,
        description,
        price,
        area,
        address,
        images,
        rating,
        reviewCount,
        amenities = [],
        roomType,
        rules
    } = roomData || {};

    return (
        <div className="room-info-section">
            {/* Image Gallery */}
            <div className="room-images">
                <Image.PreviewGroup>
                    <div className="main-image">
                        <Image
                            src={images[0]}
                            alt={title}
                            className="primary-image"
                        />
                    </div>
                    <div className="thumbnail-images">
                        {images.slice(1, 3).map((img, index) => (
                            <Image
                                key={index}
                                src={img}
                                alt={`${title} - ${index + 2}`}
                                className="thumbnail-image"
                            />
                        ))}
                        {images.length > 3 && (
                            <div className="more-images-overlay">
                                <Image
                                    src={images[3]}
                                    alt={`${title} - more`}
                                    className="thumbnail-image"
                                />
                                <div className="overlay-text">
                                    +{images.length - 3} ảnh
                                </div>
                            </div>
                        )}
                    </div>
                </Image.PreviewGroup>
            </div>

            {/* Title & Rating */}
            <div className="room-header">
                <h1 className="room-title">{title}</h1>
                <div className="room-rating">
                    <Rate disabled defaultValue={rating} allowHalf />
                    <span className="rating-text">
                        {rating} ({reviewCount} đánh giá)
                    </span>
                </div>
            </div>

            {/* Price & Area */}
            <div className="room-quick-info">
                <div className="info-item price-item">
                    <DollarOutlined className="info-icon" />
                    <div>
                        <span className="price-amount">{price.toLocaleString()}đ</span>
                        <span className="price-period">/tháng</span>
                    </div>
                </div>
                <div className="info-item">
                    <ExpandOutlined className="info-icon" />
                    <span className="info-text">{area}m²</span>
                </div>
                <div className="info-item">
                    <HomeOutlined className="info-icon" />
                    <span className="info-text">{roomType}</span>
                </div>
            </div>

            <Divider />

            {/* Address */}
            <div className="room-section">
                <h3 className="section-title">Địa chỉ</h3>
                <div className="address-info">
                    <EnvironmentOutlined className="location-icon" />
                    <span>{address}</span>
                </div>
            </div>

            <Divider />

            {/* Description */}
            <div className="room-section">
                <h3 className="section-title">Mô tả</h3>
                <p className="room-description">{description}</p>
            </div>

            <Divider />

            {/* Amenities */}
            <div className="room-section">
                <h3 className="section-title">Tiện nghi</h3>
                <div className="amenities-list">
                    {amenities.map((amenity, index) => (
                        <Tag key={index} className="amenity-tag-large">
                            {amenity}
                        </Tag>
                    ))}
                </div>
            </div>

            <Divider />

            {/* Rules */}
            <div className="room-section">
                <h3 className="section-title">Quy định</h3>
                <p className="room-rules">{rules}</p>
            </div>
        </div>
    );
};

export default RoomInfoSection;
