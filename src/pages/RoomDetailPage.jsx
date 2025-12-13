import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Spin, Button, Tabs, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import RoomInfoSection from '../components/RoomInfoSection';
import RouteMapSection from '../components/RouteMapSection';
import { getRoomRouteMapApi } from '../util/api';
import { DEFAULT_COORDINATES } from '../util/constants';
import './RoomDetailPage.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoomDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roomData, setRoomData] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [routeData, setRouteData] = useState(null);



    const buildImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http')) return url;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        return `${backendUrl}${url}`;
    };

    useEffect(() => {
        setLoading(true);
        try {
            const roomFromState = location.state?.room;
            let roomSource = roomFromState;

            if (!roomSource) {
                try {
                    const cached = localStorage.getItem('roomsListCache');
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        roomSource = parsed.find((r) => `${r.id}` === `${id}`);
                    }
                } catch (e) {
                    console.warn('Cannot read rooms cache', e);
                }
            }

            if (roomSource) {
                const imageList = [];
                if (roomSource.roomCoverImageUrl) {
                    imageList.push(buildImageUrl(roomSource.roomCoverImageUrl));
                }
                const notCoverUrls =
                    roomSource.roomNotCoverImageUrls ||
                    roomSource.roomNotCoverImages?.map((img) => img.roomNotCoverImageUrl);
                if (notCoverUrls && Array.isArray(notCoverUrls)) {
                    imageList.push(...notCoverUrls.map(buildImageUrl));
                }
                if (imageList.length === 0) {
                    imageList.push('https://via.placeholder.com/600x400');
                }

                const mappedRoom = {
                    id: roomSource.id,
                    title: roomSource.title,
                    description: roomSource.description || '',
                    price: roomSource.priceVnd,
                    area: roomSource.areaSqm,
                    address: roomSource.address,
                    location: {
                        lat: roomSource.latitude || DEFAULT_COORDINATES.latitude,
                        lng: roomSource.longitude || DEFAULT_COORDINATES.longitude,
                        district: roomSource.address?.split(',')[1]?.trim() || ''
                    },
                    images: imageList,
                    rating: roomSource.avgAmenity || roomSource.avgSecurity || 0,
                    avgAmenity: roomSource.avgAmenity,
                    avgSecurity: roomSource.avgSecurity,
                    reviewCount: 0,
                    amenities: roomSource.amenities || [],
                    distance: roomSource.distance,
                    areaTypeName: roomSource.areaTypeName,
                    roomType: roomSource.roomType || 'SINGLE',
                    status: roomSource.status,
                    rules: roomSource.rules || '',
                    landlord: {
                        id: roomSource.landlordUserId,
                        phoneNumber: roomSource.landlordPhone
                    },
                    landlordPhone: roomSource.landlordPhone,
                    areaTypeName: roomSource.areaTypeName,
                    routeToSchool: {
                        school: null,
                        distance: roomSource.distance || 0,
                        geometry: []
                    }
                };
                setRoomData(mappedRoom);
                setSelectedSchool(mappedRoom.routeToSchool.school);
            } else {
                message.error('Không tìm thấy thông tin phòng từ danh sách.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, location.state]);

    if (loading) {
        return (
            <div className="room-detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="room-detail-error">
                <p>Không tìm thấy thông tin phòng</p>
                <Button type="primary" onClick={() => navigate('/search')}>
                    Quay lại tìm kiếm
                </Button>
            </div>
        );
    }

    const tabItems = [
        {
            key: 'room-map',
            label: 'Bản đồ phòng trọ',
            children: (
                <div className="route-map-section">
                    <div className="map-header">
                        <h3 className="map-title">Vị trí phòng trọ</h3>
                    </div>
                    <div className="map-container" style={{ height: 360 }}>
                        <MapContainer
                            center={[roomData.location.lat, roomData.location.lng]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[roomData.location.lat, roomData.location.lng]}>
                                <Popup>
                                    <strong>{roomData.title}</strong>
                                    <br />
                                    {roomData.address}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    <div className="map-note">
                        <p>Tọa độ: {roomData.location.lat}, {roomData.location.lng}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'route-map',
            label: 'Bản đồ đường đi',
            children: (
                <RouteMapSection
                    roomLocation={roomData.location}
                    schoolLocation={selectedSchool}
                    routeGeometry={routeData?.geometry || roomData.routeToSchool.geometry}
                    distance={routeData?.distance || roomData.routeToSchool.distance}
                />
            )
        }
    ];

    const handleTabChange = async (key) => {
        if (key === 'route-map' && roomData) {
            try {
                const schoolId = (() => {
                    try {
                        return Number(localStorage.getItem('selectedSchoolId')) || null;
                    } catch (e) {
                        return null;
                    }
                })();
                if (!schoolId) {
                    message.warning('Vui lòng chọn trường trước khi xem bản đồ đường đi.');
                    return;
                }
                const response = await getRoomRouteMapApi(schoolId, roomData.id);
                if (response.code === '00' && response.data) {
                    const geometry = (response.data.geometry || []).map((coords) => [coords[1], coords[0]]);
                    setRouteData({
                        distance: response.data.distance,
                        geometry
                    });
                } else {
                    message.error(response.message || 'Không lấy được lộ trình.');
                }
            } catch (error) {
                console.error('Error fetching route map:', error);
                message.error('Không lấy được lộ trình.');
            }
        }
    };

    return (
        <div className="room-detail-page">
            <div className="container">
                <Button
                    className="back-button"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>

                <Row gutter={[24, 24]} className="room-detail-content">
                    {/* Left Column - Room Info */}
                    <Col xs={24} lg={10}>
                        <div className="left-column-scroll">
                            <RoomInfoSection roomData={roomData} />
                        </div>
                    </Col>

                    {/* Right Column - Map & Explanation */}
                    <Col xs={24} lg={14}>
                        <div className="right-column-scroll">
                            <div className="right-section">
                                <Tabs
                                    defaultActiveKey="room-map"
                                    items={tabItems}
                                    className="detail-tabs"
                                    onChange={handleTabChange}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default RoomDetailPage;
