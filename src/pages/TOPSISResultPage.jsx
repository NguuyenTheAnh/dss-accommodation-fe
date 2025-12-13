import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TOPSISResultPage.css';

const INIT_HEADERS = ['Giá', 'Khoảng cách', 'Diện tích', 'Tiện nghi', 'An ninh'];
const DECISION_HEADERS = [
  'Độ phù hợp về giá',
  'Độ phù hợp về khoảng cách',
  'Độ phù hợp về diện tích',
  'Độ phù hợp về tiện nghi',
  'Độ phù hợp về an ninh',
];

const MatrixTable = ({ title, headers, rows = [], rowLabels = [] }) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const labels = safeRows.map((_, idx) => rowLabels?.[idx] ?? idx + 1);
  return (
    <div className="matrix-flow-table-wrapper topsis-card">
      {title && <h3 className="matrix-flow-table-title">{title}</h3>}
      <div className="matrix-flow-table">
        <div className="matrix-flow-table-header">
          <div className="matrix-flow-cell cell-header label-col">Phòng</div>
          {headers.map((h) => (
            <div key={h} className="matrix-flow-cell cell-header">
              {h}
            </div>
          ))}
        </div>
        <div className="matrix-flow-table-body">
          {safeRows.length === 0 ? (
            <div className="matrix-flow-empty">Chưa có dữ liệu</div>
          ) : (
            safeRows.map((row, rIdx) => (
              <div key={`r-${rIdx}`} className="matrix-flow-row">
                <div className="matrix-flow-cell label-col">Phòng {labels[rIdx]}</div>
                {headers.map((_, cIdx) => (
                  <div key={`c-${cIdx}`} className="matrix-flow-cell">
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

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const TOPSISResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sortBy, setSortBy] = useState('s_star'); // s_star | s_sub | c_star

  const cache = useMemo(
    () => ({
      init: readJson('topsis_init'),
      x: readJson('topsis_x'),
      r: readJson('topsis_r'),
      v: readJson('topsis_v'),
      result: readJson('topsis_result'),
    }),
    []
  );

  const stateData = location.state || {};

  const rows = useMemo(
    () => stateData.rowIdsInMatrix || cache.v?.rows || cache.init?.rows || [],
    [cache, stateData.rowIdsInMatrix]
  );

  const topsisResult = useMemo(() => stateData.topsis || cache.result || {}, [cache.result, stateData.topsis]);

  const formatVector = (label, arr) => `${label} = (${(arr || []).join(', ')})`;
  const aSubVector = Array.isArray(topsisResult.a_sub) && Array.isArray(topsisResult.a_sub[0])
    ? topsisResult.a_sub[0]
    : topsisResult.a_sub || [];

  const ranking = useMemo(() => {
    const key = sortBy;
    const values = topsisResult[key] || [];
    const mapping = (rows || []).map((id, idx) => ({ id, score: values[idx] ?? 0 }));
    return mapping.sort((a, b) => b.score - a.score);
  }, [rows, sortBy, topsisResult]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const renderRanking = () => (
    <div className="topsis-ranking topsis-card">
      <div className="topsis-ranking-header">
        <div>
          <p className="topsis-eyebrow">Kết quả xếp hạng</p>
          <h3 className="topsis-heading">Phòng trọ theo TOPSIS</h3>
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="topsis-select">
          <option value="s_star">Sắp xếp theo s_star</option>
          <option value="s_sub">Sắp xếp theo s_sub</option>
          <option value="c_star">Sắp xếp theo c_star</option>
        </select>
      </div>
      <div className="topsis-ranking-list">
        {ranking.map((item, idx) => (
          <div key={item.id} className="topsis-ranking-item">
            <div className="topsis-ranking-title">
              {idx === 0 && <span className="best-badge">Best Choice</span>}
              <span>Phòng {item.id}</span>
            </div>
            <div className="topsis-ranking-score">Điểm: {item.score}</div>
            <button className="topsis-link" onClick={() => navigate(`/rooms/${item.id}`)}>
              Chi tiết →
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="topsis-result-page">
      <div className="topsis-layout">
        <div className="topsis-left">{renderRanking()}</div>
        <div className="topsis-right">
          <div className="topsis-page-heading">
            <p className="topsis-eyebrow">Quy trình TOPSIS</p>
            <h1>Kết quả xếp hạng phòng trọ</h1>
            <p className="topsis-sub">Ưu tiên dựa trên khoảng cách, giá, diện tích, tiện nghi và an ninh.</p>
          </div>
          <div className="topsis-matrix-stack">
            {(stateData.initMatrix || cache.init) && (
              <MatrixTable
                title="Ma trận chuẩn hóa (initMatrix)"
                headers={(stateData.initMatrix && INIT_HEADERS) || cache.init?.headers || INIT_HEADERS}
                rows={stateData.initMatrix || cache.init?.matrix || []}
                rowLabels={stateData.rowIdsInMatrix || cache.init?.rows || []}
              />
            )}
            {(stateData.xMatrix || cache.x) && (
              <MatrixTable
                title="Ma trận quyết định (X matrix)"
                headers={cache.x?.headers || DECISION_HEADERS}
                rows={stateData.xMatrix || cache.x?.matrix || []}
                rowLabels={stateData.rowIdsInMatrix || cache.x?.rows || []}
              />
            )}
            {(stateData.rMatrix || cache.r) && (
              <MatrixTable
                title="Ma trận chuẩn hóa R (rMatrix)"
                headers={cache.r?.headers || DECISION_HEADERS}
                rows={stateData.rMatrix || cache.r?.matrix || []}
                rowLabels={stateData.rowIdsInMatrix || cache.r?.rows || []}
              />
            )}
            {(stateData.vMatrix || cache.v) && (
              <MatrixTable
                title="Ma trận trọng số (vMatrix)"
                headers={cache.v?.headers || DECISION_HEADERS}
                rows={stateData.vMatrix || cache.v?.matrix || []}
                rowLabels={stateData.rowIdsInMatrix || cache.v?.rows || []}
              />
            )}
            <div className="topsis-vectors topsis-card">
              <div className="topsis-vectors-header">
                <p className="topsis-eyebrow">Kết quả TOPSIS</p>
                <h4>Điểm lý tưởng & xếp hạng</h4>
              </div>
              <div className="topsis-equations">
                <div className="topsis-equation">{formatVector('A*', topsisResult.a_star)}</div>
                <div className="topsis-equation">{formatVector('A-', aSubVector)}</div>
                <div className="topsis-equation">{formatVector('S*', topsisResult.s_star)}</div>
                <div className="topsis-equation">{formatVector('S-', topsisResult.s_sub)}</div>
                <div className="topsis-equation">{formatVector('C*', topsisResult.c_star)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TOPSISResultPage;
