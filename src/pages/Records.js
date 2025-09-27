// src/pages/Records.js
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRecords, deleteRecordById } from "../store";
import { QUESTIONS } from "../data";
import { isAdminSession } from "../auth";

const dateStr = (ts) => {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} (${d.getHours()>=12?'오후':'오전'} ${d.getHours()%12||12}:${pad(d.getMinutes())}:${pad(d.getSeconds())})`;
};

export default function Records() {
  const nav = useNavigate();
  const loc = useLocation(); // { state: { name, day } } 인입 가능
  const all = getRecords().slice().reverse(); // 최신 우선
  const admin = isAdminSession();

  const [name, setName] = useState(loc.state?.name || "전체");
  const [day, setDay] = useState(loc.state?.day || "전체");
  const [onlyWrong, setOnlyWrong] = useState(false);

  const students = useMemo(() => {
    const uniq = new Set(all.map(r => r.name).filter(Boolean));
    return ["전체", ...Array.from(uniq)];
  }, [all]);

  const days = useMemo(() => {
    const uniq = new Set(all.map(r => r.day).filter(Boolean));
    const sorted = Array.from(uniq).sort(
      (a,b)=>parseInt(String(a).replace(/\D/g,""))-parseInt(String(b).replace(/\D/g,""))
    );
    return ["전체", ...sorted];
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter(r => {
      if (name !== "전체" && r.name !== name) return false;
      if (day !== "전체" && r.day !== day) return false;
      if (onlyWrong && (!r.wrongIdxs || r.wrongIdxs.length === 0)) return false;
      return true;
    });
  }, [all, name, day, onlyWrong]);

  /** 오답만 다시 말하기(현재 Day 필터가 단일일 때 가능) */
  const handleRetakeWrong = () => {
    if (day === "전체") {
      alert("오답 다시 말하기는 Day를 하나 선택했을 때만 가능합니다.");
      return;
    }
    const target = filtered.filter(r => r.day === day && r.wrongIdxs?.length);
    if (!target.length) {
      alert("오답 문항이 없습니다.");
      return;
    }
    // 동일 qid 중복 제거
    const set = new Set();
    const qs = [];
    const pool = QUESTIONS[day] || [];
    target.forEach(r => {
      if (!set.has(r.qid)) {
        const q = pool.find(x => x.id === r.qid);
        if (q) {
          qs.push(q);
          set.add(r.qid);
        }
      }
    });
    if (!qs.length) {
      alert("문항 로딩에 실패했습니다.");
      return;
    }
    // 원래 day 총 문항 수(뱃지 체크용)
    const originTotal = pool.length;

    nav(`/exam/${day}`, {
      state: {
        name: name !== "전체" ? name : "",
        date: new Date().toISOString().slice(0,10),
        questions: qs,
        originTotal, // 모든 문항 수(오답만 재시험이어도 뱃지 검증용)
      }
    });
  };

  return (
    <div className="container">
      <div className="card" style={{maxWidth:1000}}>
        <h1 className="title">기록 보기</h1>

        <div className="row" style={{gap:12, alignItems:"center"}}>
          <select value={name} onChange={e=>setName(e.target.value)}>
            {students.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={day} onChange={e=>setDay(e.target.value)}>
            {days.map(d => <option key={d} value={d}>{String(d).toUpperCase()}</option>)}
          </select>
          <label style={{display:"flex", gap:8, alignItems:"center"}}>
            <input type="checkbox" checked={onlyWrong} onChange={e=>setOnlyWrong(e.target.checked)} />
            오답만
          </label>

          {/* Day가 단일 선택일 때만 표시 */}
          {day !== "전체" && (
            <button className="btn primary" onClick={handleRetakeWrong}>
              오답 다시 말하기
            </button>
          )}

          <button className="btn" onClick={()=>nav("/")}>처음으로</button>
        </div>

        {!filtered.length ? (
          <div className="muted" style={{marginTop:16}}>기록이 없습니다.</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12, marginTop:16}}>
            {filtered.map(r => (
              <div key={r.id} className="list">
                <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:800}}>
                      SPEAK · Day {String(r.day).toUpperCase()} · Q{r.qid}
                    </div>
                    <div className="muted">{dateStr(r.ts)}</div>
                    <div style={{marginTop:6}}>
                      점수: {r.score} / {r.totalChunks} ({Math.round((r.score/r.totalChunks)*100)}%)
                    </div>
                  </div>

                  <div className="row" style={{gap:8}}>
                    {admin && (
                      <button className="btn danger" onClick={()=>{
                        if (confirm("이 기록을 삭제할까요?")) {
                          deleteRecordById(r.id);
                          location.reload();
                        }
                      }}>삭제</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
