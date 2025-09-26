// src/pages/Learn.js
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QUESTIONS } from "../data";
import { speak, stopSpeak } from "../tts";

export default function Learn() {
  const { day } = useParams();
  const nav = useNavigate();
  const { state } = useLocation();
  const [idx, setIdx] = useState(0);

  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const q = list[idx];

  const name = state?.name || sessionStorage.getItem("name") || "";
  const date = state?.date || sessionStorage.getItem("date") || new Date().toISOString().slice(0, 10);

  if (!q) {
    return (
      <div className="container">
        <div className="card"><h2>학습할 문장이 없어요.</h2></div>
      </div>
    );
  }

  const onListenChunk = (en) => speak(en, { rate: 0.95 });
  const onListenAll = () => speak(q.full, { rate: 1 });
  const onListenSlow = () => speak(q.full, { rate: 0.8 });
  const onNext = () => { stopSpeak(); setIdx(i => Math.min(i + 1, list.length - 1)); };
  const onPrev = () => { stopSpeak(); setIdx(i => Math.max(i - 1, 0)); };
  const startExam = () => {
    stopSpeak();
    nav(`/exam/${day}`, { state: { name, date, day } });
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 1000 }}>
        <h1 className="title">학습 · 문제 {idx + 1} / {list.length}</h1>
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          {q.enChunks.map((en, i) => (
            <button key={i} className="btn" onClick={() => onListenChunk(en)}>청크{i + 1} 듣기</button>
          ))}
        </div>

        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          <button className="btn" onClick={onListenAll}>전체 듣기</button>
          <button className="btn" onClick={onListenSlow}>느리게 듣기</button>
          <button className="btn" onClick={stopSpeak}>정지</button>
        </div>

        <div className="nav" style={{ marginTop: 16 }}>
          <button className="btn" onClick={onPrev} disabled={idx === 0}>이전</button>
          <button className="btn" onClick={onNext} disabled={idx === list.length - 1}>다음</button>
          <button className="btn primary" onClick={startExam}>시험 시작</button>
        </div>
      </div>
    </div>
  );
}
