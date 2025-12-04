import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import RoomDetailManagement from '../components/RoomDetailManagement';
import { getAllRoomsApi, deleteRoomsApi, createRoomApi, getAllAreaTypesApi } from '../util/api';
import './RoomManagementPage.css';

const { Option } = Select;

const RoomManagementPage = () => {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [detailMode, setDetailMode] = useState(null); // 'view' or 'edit'
    const [areaTypes, setAreaTypes] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchRooms();
        fetchAreaTypes();
    }, []);

    const fetchAreaTypes = async () => {
        try {
            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: [
                    { id: 1, name: 'G\u1ea7n tr\u01b0\u1eddng' },
                    { id: 2, name: 'Trung t\u00e2m' },
                    { id: 3, name: 'Ngo\u1ea1i th\u00e0nh' }
                ]
            };

            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.code === '00') {
                setAreaTypes(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching area types:', error);
        }
    };

    const fetchRooms = async (page = 1) => {
        setLoading(true);
        try {
            // MOCK API - Success case with sample rooms
            const mockRooms = [
                {
                    id: 1,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Ph\u00f2ng tr\u1ecd cao c\u1ea5p g\u1ea7n \u0110H B\u00e1ch Khoa',
                    description: 'Ph\u00f2ng r\u1ed9ng r\u00e3i, \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi',
                    address: '123 \u0110\u1ea1i C\u1ed3 Vi\u1ec7t, Hai B\u00e0 Tr\u01b0ng, H\u00e0 N\u1ed9i',
                    latitude: 21.0285,
                    longitude: 105.8542,
                    priceVnd: 3500000,
                    areaSqm: 25.5,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.8,
                    avgSecurity: 4.5,
                    roomCoverImageId: 1,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
                },
                {
                    id: 2,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Chung c\u01b0 mini \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi',
                    description: 'View \u0111\u1eb9p, an ninh t\u1ed1t',
                    address: '45 Xu\u00e2n Th\u1ee7y, C\u1ea7u Gi\u1ea5y, H\u00e0 N\u1ed9i',
                    latitude: 21.0380,
                    longitude: 105.7820,
                    priceVnd: 5000000,
                    areaSqm: 35.0,
                    roomType: 'STUDIO',
                    status: 'AVAILABLE',
                    avgAmenity: 4.9,
                    avgSecurity: 4.7,
                    roomCoverImageId: 2,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                },
                {
                    id: 3,
                    landlordUserId: 1,
                    areaTypeId: 1,
                    title: 'Ph\u00f2ng \u0111\u01a1n gi\u00e1 r\u1ebb an ninh t\u1ed1t',
                    description: 'Ph\u00f2ng s\u1ea1ch s\u1ebd, ch\u1ee7 nh\u00e0 th\u00e2n thi\u1ec7n',
                    address: '78 T\u00e2y S\u01a1n, \u0110\u1ed1ng \u0110a, H\u00e0 N\u1ed9i',
                    latitude: 21.0245,
                    longitude: 105.8270,
                    priceVnd: 2000000,
                    areaSqm: 20.0,
                    roomType: 'SINGLE',
                    status: 'AVAILABLE',
                    avgAmenity: 4.2,
                    avgSecurity: 4.3,
                    roomCoverImageId: 3,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
                },
                {
                    id: 4,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Ph\u00f2ng \u0111\u00f4i tho\u00e1ng m\u00e1t, view \u0111\u1eb9p',
                    description: 'G\u1ea7n si\u00eau th\u1ecb, b\u1ec7nh vi\u1ec7n',
                    address: '12 Nguy\u1ec5n Tr\u00e3i, Thanh Xu\u00e2n, H\u00e0 N\u1ed9i',
                    latitude: 21.0015,
                    longitude: 105.8050,
                    priceVnd: 4000000,
                    areaSqm: 30.0,
                    roomType: 'SHARED',
                    status: 'AVAILABLE',
                    avgAmenity: 4.6,
                    avgSecurity: 4.4,
                    roomCoverImageId: 4,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500'
                },
                {
                    id: 5,
                    landlordUserId: 1,
                    areaTypeId: 3,
                    title: 'Nh\u00e0 nguy\u00ean c\u0103n 3 ph\u00f2ng ng\u1ee7',
                    description: 'Y\u00ean t\u0129nh, kh\u00f4ng khí trong l\u00e0nh',
                    address: '89 V\u0169 Tr\u1ecdng Ph\u1ee5ng, Ho\u00e0ng Mai, H\u00e0 N\u1ed9i',
                    latitude: 20.9850,
                    longitude: 105.8450,
                    priceVnd: 8000000,
                    areaSqm: 60.0,
                    roomType: 'APARTMENT',
                    status: 'AVAILABLE',
                    avgAmenity: 4.9,
                    avgSecurity: 4.8,
                    roomCoverImageId: 5,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
                },
                {
                    id: 6,
                    landlordUserId: 1,
                    areaTypeId: 2,
                    title: 'Studio hi\u1ec7n \u0111\u1ea1i full n\u1ed9i th\u1ea5t',
                    description: '\u0110i\u1ec7u h\u00f2a, WiFi mi\u1ec5n ph\u00ed',
                    address: '34 Nguy\u1ec5n Ch\u00ed Thanh, Ba \u0110\u00ecnh, H\u00e0 N\u1ed9i',
                    latitude: 21.0325,
                    longitude: 105.8150,
                    priceVnd: 6000000,
                    areaSqm: 28.0,
                    roomType: 'STUDIO',
                    status: 'AVAILABLE',
                    avgAmenity: 4.7,
                    avgSecurity: 4.6,
                    roomCoverImageId: 6,
                    roomCoverImageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500'
                }
            ];

            const response = {
                code: '00',
                message: null,
                data: {
                    pageNumber: page - 1,
                    pageSize: pagination.pageSize,
                    totalElements: mockRooms.length,
                    totalPages: 1,
                    data: mockRooms
                }
            };

            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.code === '00') {
                const data = response.data;
                setRooms(data.data || []);
                setPagination({
                    ...pagination,
                    current: page,
                    total: data.totalElements || 0
                });
            } else {
                message.error(response.message || 'Không thể tải danh sách phòng');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            message.error('Có lỗi xảy ra khi tải danh sách phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handleView = (record) => {
        setSelectedRoom(record);
        setDetailMode('view');
    };

    const handleEdit = (record) => {
        setSelectedRoom(record);
        setDetailMode('edit');
    };

    const handleBackToList = () => {
        setSelectedRoom(null);
        setDetailMode(null);
    };

    const handleSaveDetail = (updatedRoom) => {
        // TODO: Replace with actual API call
        // await updateRoomApi(updatedRoom.id, updatedRoom);
        message.success('Cập nhật phòng thành công');
        setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        handleBackToList();
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa phòng "${record.title}"?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    // MOCK API - Success case
                    const response = {
                        code: '00',
                        message: null,
                        data: { success: true }
                    };

                    await new Promise(resolve => setTimeout(resolve, 400));

                    if (response.code === '00') {
                        message.success('Xóa phòng thành công');
                        fetchRooms(pagination.current);
                    } else {
                        message.error(response.message || 'Không thể xóa phòng');
                    }
                } catch (error) {
                    console.error('Error deleting room:', error);
                    message.error('Có lỗi xảy ra khi xóa phòng');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            const roomData = {
                landlordUserId: 1, // TODO: Get from auth context
                title: values.name,
                description: values.description || '',
                address: values.address,
                latitude: values.latitude || 21.0285,
                longitude: values.longitude || 105.8542,
                priceVnd: values.price,
                areaSqm: values.area,
                roomType: values.roomType || 'SINGLE',
                status: values.status,
                areaTypeId: values.areaTypeId || 1,
                surveyAnswers: [],
                roomCoverImageId: null,
                roomNotCoverImageIds: []
            };

            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: { id: Math.floor(Math.random() * 10000) }
            };

            await new Promise(resolve => setTimeout(resolve, 600));

            if (response.code === '00') {
                message.success('Thêm phòng thành công');
                setModalVisible(false);
                form.resetFields();
                fetchRooms(pagination.current);
            } else {
                message.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            message.error('Có lỗi xảy ra khi tạo phòng');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Ảnh',
            dataIndex: 'roomCoverImageUrl',
            key: 'image',
            width: 100,
            render: (url) => url ? (
                <img src={url} alt="Room" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
            ) : (
                <div style={{ width: 60, height: 40, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, color: '#999' }}>No Image</span>
                </div>
            ),
        },
        {
            title: 'Tên phòng',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Giá thuê',
            dataIndex: 'priceVnd',
            key: 'priceVnd',
            render: (price) => `${price?.toLocaleString()} VNĐ`,
        },
        {
            title: 'Diện tích (m²)',
            dataIndex: 'areaSqm',
            key: 'areaSqm',
            render: (area) => area?.toFixed(1),
        },
        {
            title: 'Loại phòng',
            dataIndex: 'roomType',
            key: 'roomType',
            render: (type) => {
                const typeMap = {
                    'SINGLE': 'Đơn',
                    'SHARED': 'Chia sẻ',
                    'STUDIO': 'Studio',
                    'APARTMENT': 'Chung cư'
                };
                return typeMap[type] || type;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'AVAILABLE' ? 'green' : 'red'}>
                    {status === 'AVAILABLE' ? 'Còn trống' : 'Đã thuê'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="Xem"
                    />
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Sửa"
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        title="Xóa"
                    />
                </Space>
            ),
        },
    ];

    // If viewing/editing room detail, show detail component
    if (selectedRoom) {
        return (
            <RoomDetailManagement
                room={selectedRoom}
                mode={detailMode}
                onBack={handleBackToList}
                onSave={handleSaveDetail}
            />
        );
    }

    return (
        <div className="room-management-page">
            <div className="page-header">
                <h1 className="page-title">Quản lý phòng</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    size="large"
                >
                    Thêm phòng mới
                </Button>
            </div>

            <div className="page-content">
                <Table
                    columns={columns}
                    dataSource={rooms}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phòng`,
                        onChange: (page) => fetchRooms(page),
                    }}
                />
            </div>

            <Modal
                title="Thêm phòng mới"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        roomType: 'SINGLE',
                        status: 'AVAILABLE'
                    }}
                >
                    <Form.Item
                        label="Tên phòng"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                    >
                        <Input placeholder="VD: Phòng A101" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả chi tiết về phòng..." />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="VD: 123 Đường ABC, Quận 1" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label="Vĩ độ (Latitude)"
                            name="latitude"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                step={0.000001}
                                placeholder="VD: 21.0285"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Kinh độ (Longitude)"
                            name="longitude"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                step={0.000001}
                                placeholder="VD: 105.8542"
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label="Giá thuê (VNĐ)"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="VD: 3000000"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Diện tích (m²)"
                            name="area"
                            rules={[{ required: true, message: 'Vui lòng nhập diện tích' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={0.1}
                                placeholder="VD: 25"
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            label="Loại phòng"
                            name="roomType"
                            rules={[{ required: true, message: 'Vui lòng chọn loại phòng' }]}
                        >
                            <Select placeholder="Chọn loại phòng">
                                <Option value="SINGLE">Phòng đơn</Option>
                                <Option value="SHARED">Phòng chia sẻ</Option>
                                <Option value="STUDIO">Studio</Option>
                                <Option value="APARTMENT">Chung cư</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Khu vực"
                            name="areaTypeId"
                        >
                            <Select placeholder="Chọn khu vực">
                                {areaTypes.map(area => (
                                    <Option key={area.id} value={area.id}>{area.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Option value="AVAILABLE">Còn trống</Option>
                            <Option value="RENTED">Đã thuê</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Thêm mới
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoomManagementPage;
