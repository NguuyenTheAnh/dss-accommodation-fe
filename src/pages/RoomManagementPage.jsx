import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import RoomDetailManagement from '../components/RoomDetailManagement';
import { getAllRoomsApi, deleteRoomsApi, createRoomApi, getAllAreaTypesApi, updateRoomApi, getRoomDetailApi } from '../util/api';
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

    const buildImageUrl = (url) => {
        if (!url) return url;
        if (url.startsWith('http')) return url;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        return `${backendUrl}${url}`;
    };

    const getStoredAdminId = () => {
        try {
            const raw = localStorage.getItem('adminUser');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.id) return parsed.id;
            }
            const fallbackId = localStorage.getItem('adminUserId');
            return fallbackId ? Number(fallbackId) : null;
        } catch (error) {
            console.error('Error reading admin id from storage:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchAreaTypes();
    }, []);

    const fetchAreaTypes = async () => {
        try {
            const response = await getAllAreaTypesApi();

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
            const response = await getAllRoomsApi(page - 1, pagination.pageSize);

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
        // Tạo phòng mới rỗng với các giá trị mặc định
        const newRoom = {
            id: null, // null để đánh dấu là phòng mới
            landlordUserId: getStoredAdminId() || 1,
            areaTypeId: 1,
            areaTypeName: '',
            title: '',
            description: '',
            address: '',
            latitude: 21.0285,
            longitude: 105.8542,
            priceVnd: 0,
            areaSqm: 0,
            roomType: 'SINGLE',
            status: 'AVAILABLE',
            avgAmenity: 0,
            avgSecurity: 0,
            roomCoverImageUrl: null,
            roomNotCoverImageUrls: [],
            amenities: []
        };
        setSelectedRoom(newRoom);
        setDetailMode('add');
    };

    const openRoomDetail = async (record, modeType) => {
        setLoading(true);
        try {
            const response = await getRoomDetailApi(record.id);
            if (response.code === '00' && response.data) {
                setSelectedRoom(response.data);
                setDetailMode(modeType);
            } else {
                message.error(response.message || 'Không thể tải thông tin phòng');
            }
        } catch (error) {
            console.error('Error loading room detail:', error);
            message.error('Có lỗi khi tải thông tin phòng');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (record) => openRoomDetail(record, 'view');

    const handleEdit = (record) => openRoomDetail(record, 'edit');

    const handleBackToList = () => {
        setSelectedRoom(null);
        setDetailMode(null);
    };

    const handleSaveDetail = async (updatedRoom) => {
        try {
            const normalizedRoom = {
                ...updatedRoom,
                landlordUserId: updatedRoom.landlordUserId || getStoredAdminId() || 1,
                latitude: updatedRoom.latitude ?? 21.0285,
                longitude: updatedRoom.longitude ?? 105.8542,
                areaTypeId: updatedRoom.areaTypeId || 1,
                surveyAnswers: updatedRoom.surveyAnswers || [],
                roomCoverImageId: updatedRoom.roomCoverImageId ?? null,
                roomNotCoverImageIds: updatedRoom.roomNotCoverImageIds || []
            };

            if (detailMode === 'add') {
                // Tạo phòng mới với đầy đủ payload (survey, ảnh)
                const response = await createRoomApi(normalizedRoom);

                if (response.code === '00') {
                    message.success('Thêm phòng thành công');
                    fetchRooms(pagination.current);
                    handleBackToList();
                } else {
                    message.error(response.message || 'Có lỗi xảy ra');
                }
            } else {
                // Cập nhật phòng
                const response = await updateRoomApi(normalizedRoom);

                if (response.code === '00') {
                    message.success('Cập nhật phòng thành công');
                    setRooms(rooms.map(r => r.id === normalizedRoom.id ? normalizedRoom : r));
                    handleBackToList();
                } else {
                    message.error(response.message || 'Cập nhật phòng thất bại');
                }
            }
        } catch (error) {
            console.error('Error saving room:', error);
            message.error('Có lỗi xảy ra khi lưu phòng');
        }
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
                    const response = await deleteRoomsApi([record.id]);

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
                landlordUserId: getStoredAdminId() || 1, // TODO: Get from auth context
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

            const response = await createRoomApi(roomData);

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
                <img src={buildImageUrl(url)} alt="Room" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
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
