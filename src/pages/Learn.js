// src/pages/Learn.js
import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QUESTIONS } from "../data";
import useSpeech from "../hooks/useSpeech";
import { speakSlow, speakVerySlow } from "../lib/tts";

const norm = (s) =>
  s.toLowerCase().replace(/[.,!?;:"'()]/g, "").replace(/\s+/g, " ").trim();
const tokenize = (s) => norm(s).split(" ").filter(Boolean);

export default function Learn() {
  const nav = useNavigate();
  const { day } = useParams();
  const { state } = useLocation(); // { name, date }

  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState("");

  const q = list[idx];
  const expectedTokens = useMemo(() => tokenize(q?.enChunks?.join(" ") || ""), [q]);

  // 말하기(연습) → 인식 결과 ans에 반영
  const { canUseSpeech, listening, start, stop } = useSpeech({
    lang:"en-US",
    onResult: (text) => setAns(text),
  });

  if (!q) {
    return (
      <div className="container">
        <div className="card">
          <h2>학습할 문장이 없어요</h2>
          <div className="nav"><button className="btn" onClick={()=>nav("/")}>처음으로</button></div>
        </div>
      </div>
    );
  }

  // 즉시 컬러링
  const userTokens = tokenize(ans);
  const colored = expectedTokens.map((tk,i)=>{
    const user = userTokens[i] || "";
    const ok = user===tk || user+"s"===tk || user===tk+"s";
    return { tk, ok };
  });

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">학습 · 문제 {idx+1} / {list.length}</h1>
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        {/* 청크 듣기(느리게) — 버튼은 청크별 하나 */}
        <div className="row" style={{flexWrap:"wrap", gap:10, marginTop:10}}>
          {q.enChunks.map((chunk, i)=>(
            <button key={i} className="chip" onClick={()=>speakSlow(chunk)}>{chunk}</button>
          ))}
        </div>

        {/* 문장 전체 듣기 (느리게/아주 느리게) */}
        <div className="row" style={{gap:10, marginTop:12}}>
          <button className="btn" onClick={()=>speakSlow(q.full)}>전체(느리게)</button>
          <button className="btn" onClick={()=>speakVerySlow(q.full)}>전체(아주 느리게)</button>
        </div>

        {/* 말하기(연습) → 인식 즉시 컬러링 */}
        <div style={{marginTop:16}}>
          <div className="row" style={{gap:10}}>
            {canUseSpeech && (
              listening
                ? <button className="btn danger" onClick={stop}>정지</button>
                : <button className="btn primary" onClick={start}>말하기(연습)</button>
            )}
            <button className="btn" onClick={()=>setAns("")}>지우기</button>
          </div>

          <div className="row" style={{gap:8, flexWrap:"wrap", marginTop:10}}>
            {colored.map(({tk, ok}, i)=>(
              <span key={i} className={ok ? "word-ok" : "word-bad"}>{tk}</span>
            ))}
          </div>
        </div>

        <div className="nav">
          <button className="btn" disabled={idx===0} onClick={()=>{ setIdx(i=>i-1); setAns("");}}>이전</button>
          {idx<list.length-1
            ? <button className="btn" onClick={()=>{ setIdx(i=>i+1); setAns("");}}>다음</button>
            : <button className="btn primary" onClick={()=>{
                nav(`/exam/${day}`, { state: { name: state?.name||"", date: state?.date||new Date().toISOString().slice(0,10) } });
              }}>시험 시작</button>
          }
        </div>
      </div>
    </div>
  );
}
