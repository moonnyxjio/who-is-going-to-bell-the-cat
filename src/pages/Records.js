// src/pages/Records.js
import React, { useMemo, useState } from "react";
import { isAdminSession } from "../auth"; // 이미 쓰고 있던 관리자 세션 판별 함수
// records 저장 키
const STORE_KEY = "records";

const loadRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecords = (list) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
};

const fmtDate = (ts) => {
  try {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} (${hh}:${mi}:${ss})`;
  } catch {
    return "";
  }
};

export default function Records() {
  const admin = isAdminSession();
  const [records, setRecords] = useState(() => loadRecords());
  const [studentFilter, setStudentFilter] = useState("전체");
  const [dayFilter, setDayFilter] = useState("전체");
  const [onlyWrong, setOnlyWrong] = useState(false);

  // 드롭다운 옵션
  const students = useMemo(() => {
    const set = new Set(records.map((r) => r.name).filter(Boolean));
    return ["전체", ...Array.from(set)];
  }, [records]);

  const days = useMemo(() => {
    const set = new Set(records.map((r) => r.day).filter(Boolean));
    return ["전체", ...Array.from(set)];
  }, [records]);

  const filtered = useMemo(() => {
    let list = [...records].reverse(); // 최신 순
    if (studentFilter !== "전체") list = list.filter((r) => r.name === studentFilter);
    if (dayFilter !== "전체") list = list.filter((r) => r.day === dayFilter);
    if (onlyWrong) list = list.filter((r) => (r.wrongIdxs?.length || 0) > 0);
    return list;
  }, [records, studentFilter, dayFilter, onlyWrong]);

  const handleDelete = (idxInFiltered) => {
    if (!admin) return;
    const rec = filtered[idxInFiltered];
    if (!rec) return;
    if (!window.confirm("정말 삭제할까요?")) return;

    // filtered의 항목을 원본 records에서 찾아 제거
    const next = records.filter((r) => r.ts !== rec.ts);
    saveRecords(next);
    setRecords(next); // 리로드 없이 반영
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "records.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 1100 }}>
        <h1 className="title">기록 보기</h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {/* 학생 필터 */}
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="input"
          >
            {students.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Day 필터 */}
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="input"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {String(d).toUpperCase()}
              </option>
            ))}
          </select>

          {/* 오답만 */}
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={onlyWrong}
              onChange={(e) => setOnlyWrong(e.target.checked)}
            />
            오답만
          </label>

          <button className="btn" onClick={exportJSON}>
            내보내기(JSON)
          </button>
        </div>

        {!filtered.length ? (
          <div className="muted">표시할 기록이 없어요.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((r, i) => {
              const total = r.totalChunks ?? (r.enChunks?.length || 0);
              const wrongs = r.wrongIdxs?.length || 0;
              const score = total - wrongs;

              return (
                <div
                  key={r.ts}
                  style={{
                    border: "1px solid #2e2e2e",
                    borderRadius: 12,
                    padding: 14,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      SPEAK · Day {String(r.day).toUpperCase()} · Q{r.qid}
                    </div>
                    <div className="muted">{fmtDate(r.ts)}</div>
                  </div>

                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    점수: {score} / {total} ({Math.round((score / Math.max(total, 1)) * 100)}%)
                  </div>

                  <div className="muted" style={{ marginTop: 4 }}>
                    학생: {r.name || "-"} · Ko: {r.koChunks?.join(" / ") || "-"}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {/* 관리자일 때만 삭제 버튼 */}
                    {admin && (
                      <button className="btn danger" onClick={() => handleDelete(i)}>
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="nav" style={{ marginTop: 16 }}>
          <a className="btn" href="/">
            처음으로
          </a>
        </div>
      </div>
    </div>
  );
}
