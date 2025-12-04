import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import RoomDetailManagement from '../components/RoomDetailManagement';
import './RoomManagementPage.css';

const RoomManagementPage = () => {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [detailMode, setDetailMode] = useState(null); // 'view' or 'edit'
    const [form] = Form.useForm();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await getRoomsApi();
            // setRooms(response.data);

            // Mock data for now
            setTimeout(() => {
                setRooms([
                    {
                        id: 1,
                        name: 'Phòng A101',
                        address: '123 Đường ABC, Quận 1',
                        price: 3000000,
                        area: 25,
                        distance: 1.5,
                        status: 'available'
                    },
                    {
                        id: 2,
                        name: 'Phòng B202',
                        address: '456 Đường XYZ, Quận 2',
                        price: 3500000,
                        area: 30,
                        distance: 2.0,
                        status: 'rented'
                    }
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            message.error('Không thể tải danh sách phòng');
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
            content: `Bạn có chắc chắn muốn xóa phòng "${record.name}"?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    // TODO: Replace with actual API call
                    // await deleteRoomApi(record.id);
                    message.success('Xóa phòng thành công');
                    fetchRooms();
                } catch (error) {
                    message.error('Không thể xóa phòng');
                }
            }
        });
    };

    const handleSubmit = async (values) => {
        try {
            // TODO: Replace with actual API call
            // await createRoomApi(values);
            message.success('Thêm phòng thành công');
            setModalVisible(false);
            fetchRooms();
        } catch (error) {
            message.error('Có lỗi xảy ra');
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
            title: 'Tên phòng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Giá thuê',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString()} VNĐ`,
        },
        {
            title: 'Diện tích (m²)',
            dataIndex: 'area',
            key: 'area',
        },
        {
            title: 'Khoảng cách (km)',
            dataIndex: 'distance',
            key: 'distance',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'available' ? 'green' : 'red'}>
                    {status === 'available' ? 'Còn trống' : 'Đã thuê'}
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
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phòng`,
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
                >
                    <Form.Item
                        label="Tên phòng"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                    >
                        <Input placeholder="VD: Phòng A101" />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="VD: 123 Đường ABC, Quận 1" />
                    </Form.Item>

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
                            placeholder="VD: 25"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Khoảng cách đến trường (km)"
                        name="distance"
                        rules={[{ required: true, message: 'Vui lòng nhập khoảng cách' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.1}
                            placeholder="VD: 1.5"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <select className="status-select">
                            <option value="available">Còn trống</option>
                            <option value="rented">Đã thuê</option>
                        </select>
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
