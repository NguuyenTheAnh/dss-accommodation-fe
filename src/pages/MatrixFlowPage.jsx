import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal, InputNumber } from 'antd';
import './MatrixFlowPage.css';
import {
  getDecisionTableApi,
  getNormalizeDecisionTableApi,
  getWeightCalculateApi,
  getTopsisResultApi,
} from '../util/api';

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
const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const FALLBACK_MATRIX = [];
const FALLBACK_ROW_IDS = [];
const DEFAULT_WEIGHTS = [1, 2, 3, 4, 5];

const MatrixFlowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const xMatrixRef = useRef([]);
  const rMatrixRef = useRef([]);

  const initialMatrix = useMemo(() => {
    const fromState = location.state?.initMatrix;
    const fromCache = readJson('roomsInitMatrix');
    if (Array.isArray(fromState) && fromState.length) return fromState;
    if (Array.isArray(fromCache) && fromCache.length) return fromCache;
    return FALLBACK_MATRIX;
  }, [location.state]);

  const initialRows = useMemo(() => {
    const fromState = location.state?.rowIdsInMatrix;
    const fromCache = readJson('roomsRowIds');
    if (Array.isArray(fromState) && fromState.length) return fromState;
    if (Array.isArray(fromCache) && fromCache.length) return fromCache;
    return FALLBACK_ROW_IDS;
  }, [location.state]);

  const decisionFilter = useMemo(() => {
    const fromState = location.state?.filters;
    if (fromState && Object.keys(fromState).length) return fromState;
    const fromCache = readJson('roomsFilterPayload');
    if (fromCache && typeof fromCache === 'object') return fromCache;
    return {};
  }, [location.state]);

  const [matrixData, setMatrixData] = useState(initialMatrix);
  const [rowLabels, setRowLabels] = useState(ensureArray(initialRows));
  const [stage, setStage] = useState('init'); // init -> x -> r -> v
  const [progress, setProgress] = useState(30);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [weightModalOpen, setWeightModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDecisionAndNormalize = async () => {
      setProgress(40);
      let nextX = [];
      cacheJson('topsis_init', {
        matrix: initialMatrix,
        headers: INIT_HEADERS,
        rows: ensureArray(initialRows),
        filter: decisionFilter,
      });

      try {
        const response = await getDecisionTableApi(initialMatrix, decisionFilter);
        if (response.code === '00' && response.data?.xMatrix) {
          nextX = response.data.xMatrix;
        }
      } catch (error) {
        console.error('Không lấy được bảng quyết định:', error);
      }

      if (!isMounted) return;
      setRowLabels(ensureArray(initialRows));
      xMatrixRef.current = nextX;

      await delay(2000);
      if (!isMounted) return;
      setMatrixData(nextX);
      setStage('x');
      setProgress(65);
      cacheJson('topsis_x', { matrix: nextX, headers: DECISION_HEADERS, rows: ensureArray(initialRows) });

      let nextR = [];
      try {
        const response = await getNormalizeDecisionTableApi(nextX);
        if (response.code === '00' && response.data?.rMatrix) {
          nextR = response.data.rMatrix;
        }
      } catch (error) {
        console.error('Không lấy được ma trận R:', error);
      }

      await delay(2000);
      if (!isMounted) return;
      setMatrixData(nextR);
      setStage('r');
      setProgress(85);
      rMatrixRef.current = nextR;
      cacheJson('topsis_r', { matrix: nextR, headers: DECISION_HEADERS, rows: ensureArray(initialRows) });
      setWeightModalOpen(true);
    };

    fetchDecisionAndNormalize();

    return () => {
      isMounted = false;
    };
  }, [decisionFilter, initialMatrix, initialRows, navigate]);

  const handleWeightChange = (idx, value) => {
    const next = [...weights];
    next[idx] = value || 0;
    setWeights(next);
  };

  const handleConfirmWeights = async () => {
    setWeightModalOpen(false);
    setProgress(95);

    let nextV = [];
    let topsisResult = {};
    try {
      const response = await getWeightCalculateApi(weights, rMatrixRef.current);
      if (response.code === '00' && response.data?.vMatrix) {
        nextV = response.data.vMatrix;
      }
      const topsisRes = await getTopsisResultApi(nextV);
      if (topsisRes.code === '00' && topsisRes.data) {
        topsisResult = topsisRes.data;
      }
    } catch (error) {
      console.error('Không lấy được ma trận V / kết quả TOPSIS:', error);
    }

    setMatrixData(nextV);
    setStage('v');
    cacheJson('topsis_v', { matrix: nextV, headers: DECISION_HEADERS, rows: ensureArray(initialRows), weights });
    cacheJson('topsis_result', {
      ...topsisResult,
      rows: ensureArray(initialRows),
      filter: decisionFilter,
      weights,
    });

    await delay(2000);
    setProgress(100);
    navigate('/topsis-result', {
      state: {
        vMatrix: nextV,
        rMatrix: rMatrixRef.current,
        xMatrix: xMatrixRef.current,
        rowIdsInMatrix: initialRows,
        weights,
        filters: decisionFilter,
        topsis: topsisResult,
      },
    });
  };

  const currentHeaders = stage === 'init' ? INIT_HEADERS : DECISION_HEADERS;
  const currentTitle =
    stage === 'init'
      ? 'Bảng thuộc tính (initMatrix)'
      : stage === 'x'
        ? 'Bảng quyết định (xMatrix)'
        : stage === 'r'
          ? 'Bảng quyết định sau khi được chuẩn hóa (rMatrix)'
          : 'Bảng quyết định sau chuẩn hóa và tích hợp trọng số (vMatrix)';

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
              onChange={(val) => handleWeightChange(idx, Number(val))}
              style={{ width: 140 }}
            />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default MatrixFlowPage;
