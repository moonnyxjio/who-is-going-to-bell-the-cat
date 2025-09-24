// src/pages/Learn.js
import React, { useMemo, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data";

const speak = (text) => {
  try {
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.rate = 0.95;
    ut.pitch = 1.0;
    ut.lang = "en-US";
    window.speechSynthesis.speak(ut);
  } catch {}
};

const useSTT = () => {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const start = (onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("이 브라우저는 음성인식을 지원하지 않아요."); return; }
    if (listening) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript || "";
      onResult(text);
    };
    rec.onend = () => setListening(false);
    setListening(true);
    recRef.current = rec;
    rec.start();
  };
  const stop = () => { try { recRef.current?.stop(); } catch {} setListening(false); };
  return { listening, start, stop };
};

export default function Learn() {
  const { day } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(0); // 현재 문장 연습 횟수
  const [lastSaid, setLastSaid] = useState("");
  const { listening, start, stop } = useSTT();

  const q = list[idx];

  const onRec = (text) => {
    setLastSaid(text);
    setCount((c) => Math.min(3, c + 1));
  };

  const next = () => {
    if (idx < list.length - 1) {
      setIdx(idx + 1);
      setCount(0);
      setLastSaid("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // 학습 끝 → 시험 시작
      nav(`/exam/${day}`, { state });
    }
  };

  if (!q) {
    return (
      <div className="container">
        <div className="card"><h2>학습할 문장이 없어요.</h2></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 800 }}>
        <h1 className="title">{String(day).toUpperCase()} 학습 ({idx+1}/{list.length})</h1>
        <div className="muted" style={{ marginBottom: 6 }}>{q.koChunks?.join(" / ")}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{q.full}</div>

        <div className="nav" style={{ gap: 8 }}>
          <button className="btn" onClick={() => speak(q.full)}>문장 듣기 (TTS)</button>
          {!listening ? (
            <button className="btn primary" onClick={() => start(onRec)}>말하기 연습 {count}/3</button>
          ) : (
            <button className="btn danger" onClick={stop}>중지</button>
          )}
        </div>

        {lastSaid && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="muted">내가 말한 문장</div>
            <div style={{ marginTop: 6 }}>{lastSaid}</div>
          </div>
        )}

        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => setCount(0)}>이 문장 다시 처음부터</button>
          <button className="btn" disabled={count < 3} onClick={next}>
            {idx < list.length - 1 ? "다음 문장" : "학습 완료 → 시험 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}
