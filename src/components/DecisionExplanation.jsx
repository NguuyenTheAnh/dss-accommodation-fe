import { Table, Progress, Tag, Alert } from 'antd';
import { CheckCircleOutlined, TrophyOutlined, LineChartOutlined, CalculatorOutlined } from '@ant-design/icons';
import './DecisionExplanation.css';

const DecisionExplanation = ({ dssData, roomTitle }) => {
    const {
        rawAttributes,
        normalizedAttributes,
        weights,
        totalScore,
        rank,
        normalizationMethod,
        explanation
    } = dssData;

    // Bảng thuộc tính gốc
    const rawAttributesData = [
        {
            key: '1',
            attribute: 'Giá thuê (VNĐ/tháng)',
            value: rawAttributes.price.toLocaleString(),
            icon: '💰'
        },
        {
            key: '2',
            attribute: 'Diện tích (m²)',
            value: rawAttributes.area,
            icon: '📐'
        },
        {
            key: '3',
            attribute: 'Khoảng cách đến trường (km)',
            value: rawAttributes.distance,
            icon: '🚶'
        },
        {
            key: '4',
            attribute: 'Đánh giá (Rating)',
            value: `${rawAttributes.rating}/5`,
            icon: '⭐'
        },
        {
            key: '5',
            attribute: 'Số lượng tiện nghi',
            value: rawAttributes.amenitiesCount,
            icon: '🏠'
        },
        {
            key: '6',
            attribute: 'Điểm an ninh',
            value: `${rawAttributes.securityScore}/10`,
            icon: '🔒'
        }
    ];

    const rawAttributesColumns = [
        {
            title: 'Thuộc tính',
            dataIndex: 'attribute',
            key: 'attribute',
            render: (text, record) => (
                <span>
                    <span className="attr-icon">{record.icon}</span> {text}
                </span>
            )
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value',
            align: 'center',
            render: (value) => <strong>{value}</strong>
        }
    ];

    // Bảng chuẩn hóa và trọng số
    const normalizedData = [
        {
            key: '1',
            attribute: 'Giá thuê',
            normalized: normalizedAttributes.price,
            weight: weights.price,
            score: (normalizedAttributes.price * weights.price).toFixed(3),
            icon: '💰'
        },
        {
            key: '2',
            attribute: 'Diện tích',
            normalized: normalizedAttributes.area,
            weight: weights.area,
            score: (normalizedAttributes.area * weights.area).toFixed(3),
            icon: '📐'
        },
        {
            key: '3',
            attribute: 'Khoảng cách',
            normalized: normalizedAttributes.distance,
            weight: weights.distance,
            score: (normalizedAttributes.distance * weights.distance).toFixed(3),
            icon: '🚶'
        },
        {
            key: '4',
            attribute: 'Rating',
            normalized: normalizedAttributes.rating,
            weight: weights.rating,
            score: (normalizedAttributes.rating * weights.rating).toFixed(3),
            icon: '⭐'
        },
        {
            key: '5',
            attribute: 'Tiện nghi',
            normalized: normalizedAttributes.amenitiesCount,
            weight: weights.amenitiesCount,
            score: (normalizedAttributes.amenitiesCount * weights.amenitiesCount).toFixed(3),
            icon: '🏠'
        },
        {
            key: '6',
            attribute: 'An ninh',
            normalized: normalizedAttributes.securityScore,
            weight: weights.securityScore,
            score: (normalizedAttributes.securityScore * weights.securityScore).toFixed(3),
            icon: '🔒'
        }
    ];

    const normalizedColumns = [
        {
            title: 'Thuộc tính',
            dataIndex: 'attribute',
            key: 'attribute',
            render: (text, record) => (
                <span>
                    <span className="attr-icon">{record.icon}</span> {text}
                </span>
            )
        },
        {
            title: 'Chuẩn hóa',
            dataIndex: 'normalized',
            key: 'normalized',
            align: 'center',
            render: (value) => (
                <div className="progress-cell">
                    <Progress
                        percent={Math.round(value * 100)}
                        size="small"
                        strokeColor={{
                            '0%': '#0DB14B',
                            '100%': '#0A7A36',
                        }}
                    />
                </div>
            )
        },
        {
            title: 'Trọng số',
            dataIndex: 'weight',
            key: 'weight',
            align: 'center',
            render: (value) => (
                <Tag color="blue">{(value * 100).toFixed(0)}%</Tag>
            )
        },
        {
            title: 'Điểm',
            dataIndex: 'score',
            key: 'score',
            align: 'center',
            render: (value) => (
                <strong className="score-value">{value}</strong>
            )
        }
    ];

    return (
        <div className="decision-explanation">
            {/* Header với điểm tổng */}
            <div className="explanation-header">
                <div className="total-score-card">
                    <TrophyOutlined className="trophy-icon" />
                    <div className="score-content">
                        <span className="score-label">Điểm tổng hợp</span>
                        <span className="score-number">{totalScore.toFixed(3)}</span>
                        <Tag color="gold" className="rank-tag">
                            Xếp hạng #{rank}
                        </Tag>
                    </div>
                </div>
            </div>

            {/* Giải thích tại sao */}
            <Alert
                message="Tại sao phòng này được đề xuất?"
                description={
                    <ul className="explanation-list">
                        {explanation.map((item, index) => (
                            <li key={index}>
                                <CheckCircleOutlined className="check-icon" />
                                {item}
                            </li>
                        ))}
                    </ul>
                }
                type="success"
                icon={<LineChartOutlined />}
                showIcon
                className="explanation-alert"
            />

            {/* Bảng thuộc tính gốc */}
            <div className="table-section">
                <h4 className="section-subtitle">
                    <CalculatorOutlined /> Bước 1: Thuộc tính gốc
                </h4>
                <Table
                    dataSource={rawAttributesData}
                    columns={rawAttributesColumns}
                    pagination={false}
                    size="small"
                    className="custom-table"
                />
            </div>

            {/* Phương pháp chuẩn hóa */}
            <div className="methodology-section">
                <h4 className="section-subtitle">
                    📊 Bước 2: Phương pháp chuẩn hóa
                </h4>
                <div className="methodology-card">
                    <p>
                        <strong>Phương pháp:</strong> {normalizationMethod}
                    </p>
                    <p className="formula">
                        Công thức: <code>x' = (x - min) / (max - min)</code>
                    </p>
                    <p className="note">
                        Tất cả thuộc tính được chuẩn hóa về thang điểm 0-1 để có thể so sánh công bằng.
                        Đối với thuộc tính "càng thấp càng tốt" (như giá, khoảng cách), giá trị được đảo ngược.
                    </p>
                </div>
            </div>

            {/* Bảng chuẩn hóa và tính điểm */}
            <div className="table-section">
                <h4 className="section-subtitle">
                    🎯 Bước 3: Chuẩn hóa và tính điểm
                </h4>
                <Table
                    dataSource={normalizedData}
                    columns={normalizedColumns}
                    pagination={false}
                    size="small"
                    className="custom-table normalized-table"
                    summary={() => (
                        <Table.Summary fixed>
                            <Table.Summary.Row className="summary-row">
                                <Table.Summary.Cell index={0}>
                                    <strong>Tổng điểm</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} colSpan={2} align="center">
                                    <strong>Công thức: Σ (Chuẩn hóa × Trọng số)</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="center">
                                    <strong className="total-score-value">{totalScore.toFixed(3)}</strong>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </div>

            {/* Kết luận */}
            <div className="conclusion-section">
                <h4 className="section-subtitle">
                    ✅ Kết luận
                </h4>
                <div className="conclusion-card">
                    <p>
                        Phòng <strong>"{roomTitle}"</strong> đạt điểm tổng hợp <strong>{totalScore.toFixed(3)}</strong>
                        {' '}và được xếp hạng <strong>#{rank}</strong> trong hệ thống hỗ trợ quyết định.
                    </p>
                    <p>
                        Điểm số này được tính toán dựa trên mô hình đa thuộc tính (MCDM - Multi-Criteria Decision Making),
                        kết hợp 6 tiêu chí quan trọng với trọng số khác nhau phù hợp với nhu cầu của sinh viên.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DecisionExplanation;
