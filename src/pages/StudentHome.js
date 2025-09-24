// src/pages/StudentHome.js
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentName, clearStudentName } from "../auth";
import { QUESTIONS } from "../data";

const MASTER_KEY = "mastery_v1";
const loadMastery = () => {
  try { return JSON.parse(localStorage.getItem(MASTER_KEY) || "{}"); }
  catch { return {}; }
};

export default function StudentHome() {
  const nav = useNavigate();
  const name = getStudentName();
  const mastery = useMemo(() => loadMastery(), []);
  const myMaster = mastery[name] || {};

  const days = Object.keys(QUESTIONS || {}).sort(
    (a,b)=>parseInt(a.replace(/\D/g,""))-parseInt(b.replace(/\D/g,""))
  );

  const myRecords = useMemo(() => {
    try {
      const all = JSON.parse(localStorage.getItem("records") || "[]");
      return all.filter(r => r.name === name).sort((a,b)=>b.ts-a.ts);
    } catch { return []; }
  }, [name]);

  if (!name) {
    return (
      <div className="container">
        <div className="card">
          <h2>로그인이 필요해요</h2>
          <div className="nav"><button className="btn" onClick={()=>nav("/student")}>학생 로그인</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 960 }}>
        <h1 className="title">{name}의 학습 현황</h1>

        <h3 style={{ marginTop: 8 }}>Day 배지</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {days.map(day=>{
            const total = (QUESTIONS[day]||[]).length;
            const mastered = (myMaster[day]||[]).length;
            const done = total>0 && mastered===total;
            return (
              <div key={day} style={{
                padding:"6px 12px", borderRadius:999, border:`1px solid ${done?"#22c55e":"#666"}`,
                color: done?"#22c55e":"#bbb", background: done?"#22c55e22":"transparent", fontWeight:700
              }}>{String(day).toUpperCase()} {done?"✅ 완료":`${mastered}/${total}`}</div>
            );
          })}
        </div>

        <h3 style={{ marginTop: 16 }}>내 최근 기록</h3>
        {!myRecords.length ? (
          <div className="muted">아직 기록이 없어요.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {myRecords.slice(0,15).map(r=>{
              const wrong = new Set(r.wrongIdxs||[]);
              return (
                <div key={r.ts} style={{ border:"1px solid #2e2e2e", borderRadius:10, padding:10 }}>
                  <div className="muted" style={{ marginBottom:6 }}>
                    {r.date} · {String(r.day).toUpperCase()} · Q{r.qid} · {r.score}/{r.totalChunks} {wrong.size?"(오답)":"(정답)"}
                  </div>
                  <div style={{ fontSize:14, marginBottom:6, opacity:.85 }}>{r.koChunks?.join(" / ")}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(r.enChunks||[]).map((w,i)=>(
                      <span key={i} style={{
                        padding:"3px 8px", borderRadius:8, border:"1px solid",
                        borderColor: wrong.has(i)?"#ff6b6b":"#22c55e"
                      }}>{w}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn" onClick={()=>nav("/")}>처음으로</button>
          <button className="btn" onClick={()=>{ clearStudentName(); nav("/student"); }}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}
