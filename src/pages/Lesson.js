// src/pages/Lesson.js
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QUESTIONS } from "../data";

// ===== TTS (브라우저 기본) =====
const speak = (text, { rate = 1, pitch = 1 } = {}) => {
  if (!window.speechSynthesis) {
    alert("이 브라우저는 TTS를 지원하지 않습니다.");
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  u.pitch = pitch;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};
const stopSpeak = () => window.speechSynthesis?.cancel?.();

// ===== Speech Recognition (연습용 마이크) =====
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Lesson() {
  const { day } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();

  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const [idx, setIdx] = useState(0);
  const q = list[idx];

  // 연습용 마이크 상태
  const [listening, setListening] = useState(false);
  const [recText, setRecText] = useState("");

  if (!q) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">학습</h1>
          <p className="muted">문제가 없어요. DAY를 다시 선택해 주세요.</p>
          <div className="nav">
            <button className="btn" onClick={() => nav("/")}>처음으로</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 버튼 핸들러 =====
  const playChunk = (i) => {
    const text = q.enChunks[i];
    if (text) speak(text, { rate: 1.0 });
  };
  const playFull = (rate = 1.0) => speak(q.full, { rate });
  const prev = () => { stopSpeak(); setIdx((p) => Math.max(0, p - 1)); };
  const next = () => { stopSpeak(); setIdx((p) => Math.min(list.length - 1, p + 1)); };

  // 마지막 문제에서만 시험 시작 노출
  const onLast = idx === list.length - 1;
  const goExam = () =>
    nav(`/exam/${day}`, { state: { name: state?.name, date: state?.date } });

  // ===== 연습용 마이크 =====
  const startPractice = () => {
    if (!SR) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다 (Chrome 권장).");
      return;
    }
    setRecText("");
    const recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    recog.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      setRecText(text);
    };
    recog.start();
  };

  const stopPractice = () => {
    try {
      const recog = new SR();
      recog.stop();
    } catch (_) {}
    setListening(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">학습 · 문제 {idx + 1} / {list.length}</h1>
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        {/* 청크 버튼 = 실제 텍스트 표기 */}
        <div className="subtitle" style={{ marginTop: 8 }}>청크 듣기</div>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          {q.enChunks.map((c, i) => (
            <button
              key={i}
              className="btn"
              title={`청크 ${i + 1} 듣기`}
              onClick={() => playChunk(i)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 전체 문장 듣기 */}
        <div className="subtitle" style={{ marginTop: 12 }}>문장 전체 듣기</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => playFull(1.0)}>전체 듣기</button>
          <button className="btn" onClick={() => playFull(0.85)}>느리게 듣기</button>
          <button className="btn" onClick={stopSpeak}>정지</button>
        </div>

        {/* 말하기 연습 (마이크) */}
        <div className="subtitle" style={{ marginTop: 12 }}>말하기 연습</div>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <button
            className={`btn ${listening ? "danger" : "primary"}`}
            onClick={listening ? stopPractice : startPractice}
          >
            {listening ? "말하기 중지" : "말하기(연습)"}
          </button>
          {recText ? (
            <span className="muted">인식: <span className="word-ok">{recText}</span></span>
          ) : (
            <span className="muted">인식된 문장이 없어요.</span>
          )}
        </div>

        {/* 페이지 네비 + 시험 시작(마지막 문제에서만) */}
        <div className="nav" style={{ marginTop: 16 }}>
          <button className="btn" onClick={prev} disabled={idx === 0}>이전</button>
          <button className="btn" onClick={next} disabled={onLast}>다음</button>
          {onLast && (
            <button className="btn primary" onClick={goExam}>
              시험 시작
            </button>
          )}
          <button className="btn" onClick={() => nav("/")}>처음으로</button>
        </div>
      </div>
    </div>
  );
}
