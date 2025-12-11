import { Image, Tag, Divider } from 'antd';
import { EnvironmentOutlined, ExpandOutlined, DollarOutlined, HomeOutlined, PhoneOutlined, AimOutlined } from '@ant-design/icons';
import { ROOM_TYPE_LABELS } from '../util/constants';
import './RoomInfoSection.css';

const RoomInfoSection = ({ roomData }) => {
    const {
        title,
        description,
        price,
        area,
        address,
        images = [],
        roomType,
        status,
        avgAmenity,
        avgSecurity,
        distance,
        areaTypeName,
        landlordPhone
    } = roomData || {};

    const safeImages = images.length > 0 ? images : ['https://via.placeholder.com/600x400'];
    const displayRoomType = ROOM_TYPE_LABELS[roomType] || roomType || 'N/A';
    const displayStatus = status === 'AVAILABLE' ? 'Còn trống' : 'Đã thuê';

    return (
        <div className="room-info-section">
            {/* Image Gallery */}
            <div className="room-images">
                <Image.PreviewGroup>
                    <div className="main-image">
                        <Image
                            src={safeImages[0]}
                            alt={title}
                            className="primary-image"
                        />
                    </div>
                    <div className="thumbnail-images">
                        {safeImages.slice(1, 3).map((img, index) => (
                            <Image
                                key={index}
                                src={img}
                                alt={`${title} - ${index + 2}`}
                                className="thumbnail-image"
                            />
                        ))}
                        {safeImages.length > 3 && (
                            <div className="more-images-overlay">
                                <Image
                                    src={safeImages[3]}
                                    alt={`${title} - more`}
                                    className="thumbnail-image"
                                />
                                <div className="overlay-text">
                                    +{safeImages.length - 3} ảnh
                                </div>
                            </div>
                        )}
                    </div>
                </Image.PreviewGroup>
            </div>

            {/* Title & Rating */}
            <div className="room-header">
                <div className="room-title-wrap">
                    <h1 className="room-title">{title}</h1>
                    <Tag color={status === 'AVAILABLE' ? 'green' : 'red'}>{displayStatus}</Tag>
                </div>
            </div>

            {/* Price & Area */}
            <div className="room-quick-info">
                <div className="info-item price-item">
                    <DollarOutlined className="info-icon" />
                    <div>
                        <span className="price-amount">{price?.toLocaleString()}đ</span>
                        <span className="price-period">/tháng</span>
                    </div>
                </div>
                <div className="info-item">
                    <ExpandOutlined className="info-icon" />
                    <span className="info-text">{area}m²</span>
                </div>
                <div className="info-item">
                    <HomeOutlined className="info-icon" />
                    <span className="info-text">{displayRoomType}</span>
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

            {/* Extra Info */}
            <div className="room-section">
                <h3 className="section-title">Thông tin thêm</h3>
                <div className="info-grid">
                    <div className="info-row">
                        <span className="info-label">Khoảng cách:</span>
                        <span className="info-value">{distance ?? 'N/A'} km</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Loại khu vực:</span>
                        <span className="info-value">{areaTypeName || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Điểm tiện nghi:</span>
                        <span className="info-value">{avgAmenity?.toFixed(1) || 'N/A'}/5</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Điểm an ninh:</span>
                        <span className="info-value">{avgSecurity?.toFixed(1) || 'N/A'}/5</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label"><PhoneOutlined /> Liên hệ:</span>
                        <span className="info-value">{landlordPhone || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label"><AimOutlined /> Trạng thái:</span>
                        <span className="info-value">{displayStatus}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomInfoSection;
