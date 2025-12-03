import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { EnvironmentOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import './RouteMapSection.css';

// Fix Leaflet default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom school icon
const schoolIcon = L.divIcon({
    className: 'school-marker-icon',
    html: '<div class="school-marker-content">🎓</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const RouteMapSection = ({ roomLocation, schoolLocation, routeGeometry, distance }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        // Auto-fit map to show both markers and route
        if (mapRef.current && routeGeometry && routeGeometry.length > 0) {
            const map = mapRef.current;
            const bounds = L.latLngBounds(routeGeometry);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routeGeometry]);

    const center = roomLocation ? [roomLocation.lat, roomLocation.lng] : [21.0285, 105.8544];

    return (
        <div className="route-map-section">
            <div className="map-header">
                <h3 className="map-title">
                    <EnvironmentOutlined /> Lộ trình đến trường
                </h3>
                <div className="distance-info">
                    <span className="distance-label">Khoảng cách:</span>
                    <span className="distance-value">{distance} km</span>
                </div>
            </div>

            <div className="map-container">
                <MapContainer
                    center={center}
                    zoom={14}
                    ref={mapRef}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Route Polyline */}
                    {routeGeometry && routeGeometry.length > 0 && (
                        <Polyline
                            positions={routeGeometry}
                            color="#0DB14B"
                            weight={5}
                            opacity={0.7}
                        />
                    )}

                    {/* Room Marker */}
                    {roomLocation && (
                        <Marker position={[roomLocation.lat, roomLocation.lng]}>
                            <Popup>
                                <strong>Vị trí phòng trọ</strong>
                                <br />
                                {roomLocation.district}
                            </Popup>
                        </Marker>
                    )}

                    {/* School Marker */}
                    {schoolLocation && (
                        <Marker
                            position={[schoolLocation.lat, schoolLocation.lng]}
                            icon={schoolIcon}
                        >
                            <Popup>
                                <strong>{schoolLocation.name}</strong>
                                <br />
                                Điểm đến
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <div className="map-legend">
                <div className="legend-item">
                    <div className="legend-icon room-icon">📍</div>
                    <span>Vị trí phòng trọ</span>
                </div>
                <div className="legend-item">
                    <div className="legend-icon school-icon">🎓</div>
                    <span>Trường học</span>
                </div>
                <div className="legend-item">
                    <div className="legend-line"></div>
                    <span>Lộ trình đi bộ/xe máy</span>
                </div>
            </div>

            <div className="map-note">
                <p>
                    💡 <strong>Ghi chú:</strong> Lộ trình hiển thị là đường đi ngắn nhất từ phòng trọ đến trường học.
                    Thời gian di chuyển thực tế có thể thay đổi tùy theo phương tiện và tình trạng giao thông.
                </p>
            </div>
        </div>
    );
};

export default RouteMapSection;
