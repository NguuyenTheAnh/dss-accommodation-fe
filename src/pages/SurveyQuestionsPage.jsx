import { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { HolderOutlined } from '@ant-design/icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    getAllSurveysApi,
    getAllSurveyQuestionsApi,
    createSurveyQuestionApi,
    updateSurveyQuestionApi,
    deleteSurveyQuestionsApi,
    reorderSurveyQuestionsApi
} from '../util/api';
import './SurveyQuestionsPage.css';

const SurveyQuestionsPage = () => {
    const [form] = Form.useForm();
    const [surveys, setSurveys] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Drag and Drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchQuestions(activeTab);
        }
    }, [activeTab]);

    // Fetch all surveys (AMENITY & SECURITY)
    const fetchSurveys = async () => {
        try {
            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: [
                    {
                        id: 1,
                        type: 'AMENITY',
                        title: 'Đánh giá tiện nghi',
                        description: 'Đánh giá các tiện nghi trong phòng và khu vực xung quanh'
                    },
                    {
                        id: 2,
                        type: 'SECURITY',
                        title: 'Đánh giá an ninh',
                        description: 'Đánh giá mức độ an toàn và an ninh của khu vực'
                    }
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.code === '00' && response.data) {
                setSurveys(response.data);
                if (response.data.length > 0 && !activeTab) {
                    setActiveTab(response.data[0].id);
                }
            } else {
                message.error(response.message || 'Không thể tải danh sách khảo sát');
            }
        } catch (error) {
            console.error('Error fetching surveys:', error);
            message.error('Có lỗi xảy ra khi tải danh sách khảo sát');
        }
    };

    // Fetch questions of selected survey
    const fetchQuestions = async (surveyId) => {
        try {
            setLoading(true);

            // MOCK API - Success case with sample questions
            const mockQuestions = {
                1: [ // AMENITY questions
                    { id: 1, surveyId: 1, questionText: 'Phòng có điều hòa không?', questionOrder: 1 },
                    { id: 2, surveyId: 1, questionText: 'Phòng có máy nước nóng không?', questionOrder: 2 },
                    { id: 3, surveyId: 1, questionText: 'Phòng có tủ lạnh không?', questionOrder: 3 },
                    { id: 4, surveyId: 1, questionText: 'Phòng có máy giặt riêng hoặc chung không?', questionOrder: 4 },
                    { id: 5, surveyId: 1, questionText: 'Phòng có WiFi không? Tốc độ như thế nào?', questionOrder: 5 },
                    { id: 6, surveyId: 1, questionText: 'Khu vực có siêu thị, chợ gần không?', questionOrder: 6 },
                    { id: 7, surveyId: 1, questionText: 'Có chỗ để xe riêng không?', questionOrder: 7 },
                ],
                2: [ // SECURITY questions
                    { id: 8, surveyId: 2, questionText: 'Có bảo vệ 24/7 không?', questionOrder: 1 },
                    { id: 9, surveyId: 2, questionText: 'Có camera an ninh không?', questionOrder: 2 },
                    { id: 10, surveyId: 2, questionText: 'Cửa phòng có khóa an toàn không?', questionOrder: 3 },
                    { id: 11, surveyId: 2, questionText: 'Khu vực có đèn chiếu sáng đầy đủ ban đêm không?', questionOrder: 4 },
                    { id: 12, surveyId: 2, questionText: 'Có hệ thống báo cháy không?', questionOrder: 5 },
                ]
            };

            const response = {
                code: '00',
                message: null,
                data: mockQuestions[surveyId] || []
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));

            if (response.code === '00' && response.data) {
                // Sort by questionOrder
                const sortedQuestions = [...response.data].sort((a, b) => a.questionOrder - b.questionOrder);
                setQuestions(sortedQuestions);
            } else {
                message.error(response.message || 'Không thể tải câu hỏi');
                setQuestions([]);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            message.error('Có lỗi xảy ra khi tải câu hỏi');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Open modal to add new question
    const handleAdd = () => {
        setEditingQuestion(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Open modal to edit question
    const handleEdit = (record) => {
        setEditingQuestion(record);
        form.setFieldsValue({
            questionText: record.questionText,
            questionOrder: record.questionOrder
        });
        setModalVisible(true);
    };

    // Delete question(s)
    const handleDelete = async (ids) => {
        try {
            // MOCK API - Success case
            const response = {
                code: '00',
                message: null,
                data: { success: true }
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (response.code === '00') {
                message.success('Xóa câu hỏi thành công');
                fetchQuestions(activeTab);
            } else {
                message.error(response.message || 'Xóa câu hỏi thất bại');
            }
        } catch (error) {
            console.error('Error deleting questions:', error);
            message.error('Có lỗi xảy ra khi xóa câu hỏi');
        }
    };

    // Submit form (create or update)
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            if (editingQuestion) {
                // MOCK API - Update existing question
                const updateData = {
                    id: editingQuestion.id,
                    surveyId: activeTab,
                    questionText: values.questionText,
                    questionOrder: values.questionOrder || editingQuestion.questionOrder
                };

                const response = {
                    code: '00',
                    message: null,
                    data: { id: editingQuestion.id, ...updateData }
                };

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                if (response.code === '00') {
                    message.success('Cập nhật câu hỏi thành công');
                    setModalVisible(false);
                    fetchQuestions(activeTab);
                } else {
                    message.error(response.message || 'Cập nhật câu hỏi thất bại');
                }
            } else {
                // MOCK API - Create new question
                const createData = {
                    surveyId: activeTab,
                    questionText: values.questionText
                };

                const response = {
                    code: '00',
                    message: null,
                    data: { id: Math.floor(Math.random() * 10000), ...createData, questionOrder: questions.length + 1 }
                };

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                if (response.code === '00') {
                    message.success('Thêm câu hỏi thành công');
                    setModalVisible(false);
                    fetchQuestions(activeTab);
                } else {
                    message.error(response.message || 'Thêm câu hỏi thất bại');
                }
            }
        } catch (error) {
            console.error('Error submitting question:', error);
            message.error('Có lỗi xảy ra khi lưu câu hỏi');
        } finally {
            setLoading(false);
        }
    };    // Handle drag end event
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);

        // Optimistic update - cập nhật UI ngay
        const newQuestions = arrayMove(questions, oldIndex, newIndex);

        // Cập nhật questionOrder cho tất cả câu hỏi
        const updatedQuestions = newQuestions.map((q, index) => ({
            ...q,
            questionOrder: index + 1
        }));

        setQuestions(updatedQuestions);

        try {
            // Chuẩn bị data để gọi API
            const orders = updatedQuestions.map(q => ({
                id: q.id,
                questionOrder: q.questionOrder
            }));

            // MOCK API - Gọi API reorder
            // Khi backend sẵn sàng, uncomment dòng dưới và comment phần mock
            // const response = await reorderSurveyQuestionsApi({ surveyId: activeTab, orders });

            const response = {
                code: '00',
                message: null,
                data: {
                    success: true,
                    updatedCount: orders.length
                }
            };

            // Simulate API delay (chỉ cho mock)
            await new Promise(resolve => setTimeout(resolve, 400));

            if (response.code === '00') {
                message.success('Đã cập nhật thứ tự câu hỏi');
            } else {
                // Rollback nếu API fail
                message.error(response.message || 'Không thể cập nhật thứ tự');
                fetchQuestions(activeTab);
            }
        } catch (error) {
            console.error('Error reordering questions:', error);
            message.error('Có lỗi xảy ra khi cập nhật thứ tự');
            // Rollback
            fetchQuestions(activeTab);
        }
    };

    // Sortable Row Component với drag handle
    const SortableRow = ({ id, ...props }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id });

        const style = {
            ...props.style,
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <tr
                ref={setNodeRef}
                style={style}
                {...props}
                data-row-key={id}
            >
                {/* Inject drag handle as first cell */}
                <td className="drag-handle-cell" style={{ width: 60, textAlign: 'center', padding: '8px' }}>
                    <div
                        {...attributes}
                        {...listeners}
                        className="drag-handle"
                        style={{
                            cursor: 'grab',
                            fontSize: '18px',
                            color: '#999',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <HolderOutlined />
                    </div>
                </td>
                {props.children}
            </tr>
        );
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'questionOrder',
            key: 'questionOrder',
            width: 80,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Câu hỏi',
            dataIndex: 'questionText',
            key: 'questionText',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            render: (_, record, index) => (
                <Space>
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa câu hỏi"
                        description="Bạn có chắc muốn xóa câu hỏi này?"
                        onConfirm={() => handleDelete([record.id])}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const tabItems = surveys.map(survey => ({
        key: survey.id.toString(),
        label: (
            <span>
                {survey.type === 'AMENITY' ? '' : ''} {survey.title || survey.type}
            </span>
        ),
        children: (
            <div className="questions-content">
                <div className="questions-header">
                    <div>
                        <h3>{survey.title}</h3>
                        <p className="survey-description">{survey.description}</p>
                        <Tag color={survey.type === 'AMENITY' ? 'green' : 'blue'}>
                            {survey.type}
                        </Tag>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        Thêm câu hỏi
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ width: 60, padding: '12px 8px', textAlign: 'center' }}></th>
                                    <th style={{ width: 80, padding: '12px 16px', fontWeight: 600, color: '#262626' }}>STT</th>
                                    <th style={{ padding: '12px 16px', fontWeight: 600, color: '#262626' }}>Câu hỏi</th>
                                    <th style={{ width: 180, padding: '12px 16px', fontWeight: 600, color: '#262626' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
                                            Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                                        </td>
                                    </tr>
                                ) : (
                                    questions.map((question) => (
                                        <SortableRow key={question.id} id={question.id}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Tag color="blue">{question.questionOrder}</Tag>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>{question.questionText}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        ghost
                                                        icon={<EditOutlined />}
                                                        onClick={() => handleEdit(question)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Popconfirm
                                                        title="Xóa câu hỏi"
                                                        description="Bạn có chắc muốn xóa câu hỏi này?"
                                                        onConfirm={() => handleDelete([question.id])}
                                                        okText="Xóa"
                                                        cancelText="Hủy"
                                                        okButtonProps={{ danger: true }}
                                                    >
                                                        <Button type="primary" danger icon={<DeleteOutlined />}>
                                                            Xóa
                                                        </Button>
                                                    </Popconfirm>
                                                </Space>
                                            </td>
                                        </SortableRow>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </SortableContext>
                </DndContext>
            </div>
        ),
    }));

    return (
        <div className="survey-questions-page">
            <Card className="page-card">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Quản lý Câu hỏi Khảo sát</h1>
                        <p className="page-description">
                            Quản lý câu hỏi đánh giá tiện nghi và an ninh cho phòng trọ.
                            Chủ trọ sẽ tự chấm điểm 1-5 cho từng câu hỏi khi tạo phòng.
                        </p>
                    </div>
                </div>

                <Tabs
                    activeKey={activeTab?.toString()}
                    onChange={(key) => setActiveTab(parseInt(key))}
                    items={tabItems}
                    size="large"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
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
                        label="Nội dung câu hỏi"
                        name="questionText"
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung câu hỏi' },
                            { min: 10, message: 'Câu hỏi phải có ít nhất 10 ký tự' }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="VD: Phòng có điều hòa không?"
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    {editingQuestion && (
                        <Form.Item
                            label="Thứ tự hiển thị"
                            name="questionOrder"
                            help="Để trống nếu không muốn thay đổi thứ tự"
                        >
                            <Input
                                type="number"
                                min={1}
                                placeholder={`Hiện tại: ${editingQuestion.questionOrder}`}
                            />
                        </Form.Item>
                    )}

                    <div className="modal-note">
                        <p>
                            💡 <strong>Lưu ý:</strong>
                        </p>
                        <ul>
                            <li>Câu hỏi mới sẽ tự động thêm vào cuối danh sách</li>
                            <li>Chủ trọ sẽ chấm điểm từ 1 (rất kém) đến 5 (rất tốt)</li>
                            <li>Điểm trung bình sẽ tính thành avgAmenity hoặc avgSecurity</li>
                        </ul>
                    </div>

                    <Form.Item className="modal-actions">
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingQuestion ? 'Cập nhật' : 'Thêm câu hỏi'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SurveyQuestionsPage;
