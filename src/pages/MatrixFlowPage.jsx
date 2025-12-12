import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, InputNumber } from 'antd';
import './MatrixFlowPage.css';
import { getDecisionTableApi, getNormalizeDecisionTableApi, getWeightCalculateApi } from '../util/api';

const INIT_HEADERS = ['Giá', 'Khoảng cách', 'Diện tích', 'Tiện nghi', 'An ninh'];
const DECISION_HEADERS = [
  'Độ phù hợp về giá',
  'Độ phù hợp về khoảng cách',
  'Độ phù hợp về diện tích',
  'Độ phù hợp về tiện nghi',
  'Độ phù hợp về an ninh',
];

const ensureArray = (val) => (Array.isArray(val) ? val : []);
const cacheJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Cannot cache', key, err);
  }
};

const MatrixTable = ({ data = [], title, rowLabels = [], headers = INIT_HEADERS }) => {
  const rows = Array.isArray(data) ? data : [];
  const labels = rows.map((_, idx) => ensureArray(rowLabels)[idx] ?? idx + 1);

  return (
    <div className="matrix-flow-table-wrapper">
      {title && <h3 className="matrix-flow-table-title">{title}</h3>}
      <div className="matrix-flow-table">
        <div className="matrix-flow-table-header">
          <div className="matrix-flow-cell cell-header label-col">Phòng</div>
          {headers.map((header, idx) => (
            <div key={idx} className="matrix-flow-cell cell-header">
              {header}
            </div>
          ))}
        </div>
        <div className="matrix-flow-table-body">
          {rows.length === 0 ? (
            <div className="matrix-flow-empty">Chưa có dữ liệu ma trận</div>
          ) : (
            rows.map((row, rIdx) => (
              <div key={`row-${rIdx}`} className="matrix-flow-row">
                <div className="matrix-flow-cell label-col">Phòng {labels[rIdx]}</div>
                {headers.map((_, cIdx) => (
                  <div key={`cell-${rIdx}-${cIdx}`} className="matrix-flow-cell">
                    {row?.[cIdx] ?? '-'}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const parseStoredJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`Cannot parse cached ${key}`, err);
    return null;
  }
};

const FALLBACK_MATRIX = [
  [0.85, 0.6, 0.9, 0.15, 0.2],
  [0.75, 0.8, 0.88, 0.15, 0.2],
  [0.7, 0.55, 0.78, 0.15, 0.2],
];

const MOCK_X_MATRIX = [
  [0.82, 0.64, 0.91, 0.18, 0.23],
  [0.78, 0.76, 0.86, 0.17, 0.21],
  [0.69, 0.58, 0.8, 0.16, 0.2],
];

const MOCK_R_MATRIX = [
  [0.81, 0.62, 0.9, 0.2, 0.25],
  [0.77, 0.78, 0.87, 0.19, 0.23],
  [0.7, 0.6, 0.8, 0.18, 0.22],
];

const MOCK_V_MATRIX = [
  [0.8, 0.61, 0.92, 0.2, 0.25],
  [0.76, 0.77, 0.88, 0.19, 0.23],
  [0.71, 0.59, 0.81, 0.18, 0.22],
];

const FALLBACK_ROW_IDS = [1, 2, 3];
const DEFAULT_WEIGHTS = [1, 2, 3, 4, 5];

const MatrixFlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const switchTimerRef = useRef(null);
  const normalizeTimerRef = useRef(null);
  const navigateTimerRef = useRef(null);

  const xMatrixRef = useRef([]);
  const rMatrixRef = useRef([]);

  const initialMatrix = useMemo(() => {
    const fromState = location.state?.initMatrix;
    const fromCache = parseStoredJson('roomsInitMatrix');
    if (Array.isArray(fromState) && fromState.length) return fromState;
    if (Array.isArray(fromCache) && fromCache.length) return fromCache;
    return FALLBACK_MATRIX;
  }, [location.state]);

  const initialRows = useMemo(() => {
    const fromState = location.state?.rowIdsInMatrix;
    const fromCache = parseStoredJson('roomsRowIds');
    if (Array.isArray(fromState) && fromState.length) return fromState;
    if (Array.isArray(fromCache) && fromCache.length) return fromCache;
    return FALLBACK_ROW_IDS;
  }, [location.state]);

  const filters = useMemo(() => location.state?.filters || {}, [location.state]);

  const [matrixData, setMatrixData] = useState(initialMatrix);
  const [rowLabels, setRowLabels] = useState(ensureArray(initialRows));
  const [stage, setStage] = useState('init'); // init -> x -> r -> v
  const [progress, setProgress] = useState(30);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [weightModalOpen, setWeightModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDecisionAndNormalize = async () => {
      setProgress(50);
      let nextX = MOCK_X_MATRIX;
      cacheJson('topsis_init', { matrix: initialMatrix, headers: INIT_HEADERS, rows: ensureArray(initialRows) });

      /* TODO: Bật lại call thật khi sẵn sàng
      try {
        const response = await getDecisionTableApi(initialMatrix, filters);
        if (response.code === '00' && response.data?.xMatrix) {
          nextX = response.data.xMatrix;
        }
      } catch (error) {
        console.error('Không lấy được bảng quyết định:', error);
      }
      */

      if (!isMounted) return;
      setRowLabels(ensureArray(initialRows));
      xMatrixRef.current = nextX;

      switchTimerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setMatrixData(nextX);
        setStage('x');
        setProgress(70);
        cacheJson('topsis_x', { matrix: nextX, headers: DECISION_HEADERS, rows: ensureArray(initialRows) });

        let nextR = MOCK_R_MATRIX;
        /* TODO: Bật lại call thật khi sẵn sàng
        try {
          const response = await getNormalizeDecisionTableApi(nextX);
          if (response.code === '00' && response.data?.rMatrix) {
            nextR = response.data.rMatrix;
          }
        } catch (error) {
          console.error('Không lấy được ma trận R:', error);
        }
        */

        normalizeTimerRef.current = setTimeout(() => {
          if (!isMounted) return;
          setMatrixData(nextR);
          setStage('r');
          setProgress(85);
          rMatrixRef.current = nextR;
          cacheJson('topsis_r', { matrix: nextR, headers: DECISION_HEADERS, rows: ensureArray(initialRows) });
          setWeightModalOpen(true);
        }, 2000);
      }, 2000);
    };

    fetchDecisionAndNormalize();

    return () => {
      isMounted = false;
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      if (normalizeTimerRef.current) clearTimeout(normalizeTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, [filters, initialMatrix, initialRows, navigate]);

  const handleWeightChange = (idx, value) => {
    const next = [...weights];
    next[idx] = value;
    setWeights(next);
  };

  const handleConfirmWeights = async () => {
    setWeightModalOpen(false);
    setProgress(95);

    let nextV = MOCK_V_MATRIX;
    /* TODO: Bật lại call thật khi sẵn sàng
    try {
      const response = await getWeightCalculateApi(weights, rMatrixRef.current);
      if (response.code === '00' && response.data?.vMatrix) {
        nextV = response.data.vMatrix;
      }
    } catch (error) {
      console.error('Không lấy được ma trận V:', error);
    }
    */

    setMatrixData(nextV);
    setStage('v');
    cacheJson('topsis_v', { matrix: nextV, headers: DECISION_HEADERS, rows: ensureArray(initialRows), weights });

    navigateTimerRef.current = setTimeout(() => {
      setProgress(100);
      navigate('/topsis-result', {
        state: {
          vMatrix: nextV,
          rMatrix: rMatrixRef.current,
          xMatrix: xMatrixRef.current,
          rowIdsInMatrix: initialRows,
          weights,
          filters,
        },
      });
    }, 2000);
  };

  const currentHeaders = stage === 'init' ? INIT_HEADERS : DECISION_HEADERS;
  const currentTitle =
    stage === 'init'
      ? 'Ma trận chuẩn hóa (initMatrix)'
      : stage === 'x'
      ? 'Ma trận quyết định (X matrix)'
      : stage === 'r'
      ? 'Ma trận chuẩn hóa R (rMatrix)'
      : 'Ma trận trọng số (vMatrix)';

  return (
    <div className="matrix-flow-page">
      <div className="matrix-flow-container">
        <div className="matrix-progress">
          <div className="matrix-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {stage === 'r' || stage === 'v' ? (
          <Button type="primary" onClick={() => setWeightModalOpen(true)} style={{ alignSelf: 'flex-end' }}>
            Chọn độ ưu tiên
          </Button>
        ) : null}

        <MatrixTable data={matrixData} rowLabels={rowLabels} headers={currentHeaders} title={currentTitle} />
      </div>

      <Modal
        title="Sắp xếp độ ưu tiên tiêu chí"
        open={weightModalOpen}
        onOk={handleConfirmWeights}
        onCancel={() => setWeightModalOpen(false)}
        okText="Áp dụng"
        cancelText="Hủy"
      >
        <p style={{ marginBottom: 12, color: '#5f6b7a' }}>
          Trọng số thể hiện mức độ ưu tiên cho từng tiêu chí. Nhập số lớn hơn 0 (ví dụ 1-5),
          giá trị càng lớn thì tiêu chí càng quan trọng.
        </p>
        {DECISION_HEADERS.map((label, idx) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <div style={{ flex: 1 }}>{label}</div>
            <InputNumber
              min={0.01}
              step={0.1}
              value={weights[idx]}
              onChange={(val) => handleWeightChange(idx, Number(val) || 0)}
              style={{ width: 140 }}
            />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default MatrixFlowPage;
