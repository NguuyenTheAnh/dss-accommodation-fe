// Room Type Enum
export const ROOM_TYPE = {
    SINGLE: 'SINGLE',
    DOUBLE: 'DOUBLE',
    SHARED: 'SHARED',
};

export const ROOM_TYPE_LABELS = {
    [ROOM_TYPE.SINGLE]: 'Phòng đơn',
    [ROOM_TYPE.DOUBLE]: 'Phòng đôi',
    [ROOM_TYPE.SHARED]: 'Phòng chia sẻ',
};

// Room Status Enum
export const ROOM_STATUS = {
    AVAILABLE: 'AVAILABLE',
    RENTED: 'RENTED'
};

export const ROOM_STATUS_LABELS = {
    [ROOM_STATUS.AVAILABLE]: 'Còn trống',
    [ROOM_STATUS.RENTED]: 'Đã thuê'
};

// Survey Type Enum
export const SURVEY_TYPE = {
    AMENITY: 'AMENITY',
    SECURITY: 'SECURITY'
};

export const SURVEY_TYPE_LABELS = {
    [SURVEY_TYPE.AMENITY]: 'Tiện nghi',
    [SURVEY_TYPE.SECURITY]: 'An ninh'
};

// Default coordinates (Hanoi)
export const DEFAULT_COORDINATES = {
    latitude: 21.0285,
    longitude: 105.8542
};

// Response codes
export const RESPONSE_CODE = {
    SUCCESS: '00',
    ERROR: 'exception'
};
