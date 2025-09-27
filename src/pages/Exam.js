// src/pages/Exam.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QUESTIONS } from "../data";

const STORE_KEY = "records";

// 소문자/문장부호 제거/공백정리
const norm = (s = "") =>
  s.toLowerCase().replace(/[.,!?;:"'()]/g, "").replace(/\s+/g, " ").trim();

const tokenize = (s = "") => norm(s).split(" ").filter(Boolean);

// 하이라이트 렌더링
const Highlight = ({ expected = [], wrongIdxs = [] }) => {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {expected.map((w, i) => {
        const wrong = wrongIdxs.includes(i);
        return (
          <span
            key={`${w}-${i}`}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              fontWeight: 700,
              background: wrong ? "#3a1216" : "#102b1a",
              color: wrong ? "#ff6b7a" : "#22c55e",
              border: `1px solid ${wrong ? "#6f1d1b" : "#164e2a"}`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export default function Exam() {
  const nav = useNavigate();
  const { state } = useLocation(); // Home/Learn에서 넘긴 {name,date}
  const { day } = useParams();

  const [idx, setIdx] = useState(0); // 현재 문제 index
  const [heard, setHeard] = useState(""); // 음성 인식된 문자열
  const [expectedTokens, setExpectedTokens] = useState([]);
  const [wrongIdxs, setWrongIdxs] = useState([]);
  const [listening, setListening] = useState(false);

  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const q = list[idx];

  // Web Speech API 설정
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 최신 버전을 권장합니다.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false; // 중간결과 X
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      console.error("SpeechRecognition error", e);
      setListening(false);
    };
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript || "";
      setHeard(transcript);
      // 들은 즉시 채점
      if (q) {
        const expTokens = tokenize(q.enChunks.join(" "));
        setExpectedTokens(expTokens);
        const user = tokenize(transcript);
        const wrong = [];
        expTokens.forEach((exp, i) => {
          const u = user[i] || "";
          if (u === exp) return;
          if (u + "s" === exp || u === exp + "s") return; // 복수형 약허용
          wrong.push(i);
        });
        setWrongIdxs(wrong);
      }
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {}
    };
  }, [q]);

  // 현재 문제 바뀌면 표시 초기화
  useEffect(() => {
    setHeard("");
    setWrongIdxs([]);
    if (q) setExpectedTokens(tokenize(q.enChunks.join(" ")));
  }, [idx, q]);

  if (!q) {
    return (
      <div className="container">
        <div className="card">
          <h2>문제가 없어요</h2>
          <div className="nav">
            <button className="btn" onClick={() => nav("/")}>
              처음으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startSpeak = async () => {
    // HTTPS 환경 또는 localhost에서만 동작. 첫 사용 시 권한 요청.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (e) {
      console.warn("마이크 권한 거부 또는 오류", e);
    }
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn("start() 중복 호출", e);
    }
  };

  const stopSpeak = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const checkAndSave = () => {
    // 채점 결과(heard, wrongIdxs)가 이미 세팅되어 있음
    const rec = {
      name: state?.name || "",
      date: state?.date || new Date().toISOString().slice(0, 10),
      day,
      qid: q.id,
      koChunks: q.koChunks,
      enChunks: expectedTokens,
      full: q.full,
      user: heard,
      wrongIdxs,
      totalChunks: expectedTokens.length,
      score: expectedTokens.length - wrongIdxs.length,
      ts: Date.now(),
    };
    const prev = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    localStorage.setItem(STORE_KEY, JSON.stringify([...prev, rec]));
  };

  const next = () => {
    if (idx < list.length - 1) {
      setIdx((v) => v + 1);
    } else {
      // 시험 모두 완료 → 결과/기록 페이지로 이동
      nav("/records");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 1000 }}>
        <h1 className="title">시험 · 문제 {idx + 1} / {list.length}</h1>

        {/* 한국어 청크만 표기 — 영어 정답은 숨김 */}
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        {/* 채점 결과 하이라이트 (정답 단어가 노출되지만 이미 학생 발화 후 피드백용) */}
        {!!expectedTokens.length && (
          <Highlight expected={expectedTokens} wrongIdxs={wrongIdxs} />
        )}

        {/* 인식된 문장 (학생 피드백용) */}
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            border: "1px dashed #333",
            borderRadius: 10,
            color: "#a1a1aa",
          }}
        >
          {heard ? heard : (listening ? "듣는 중…" : "아직 인식된 문장이 없어요.")}
        </div>

        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={startSpeak} disabled={listening}>
            {listening ? "듣는 중…" : "말하기"}
          </button>
          <button className="btn" onClick={stopSpeak}>
            정지
          </button>
          <button
            className="btn"
            onClick={checkAndSave}
            disabled={!heard}
            title={!heard ? "먼저 말하기로 문장을 인식하세요" : ""}
          >
            채점/기록
          </button>
          <button className="btn" onClick={next}>
            {idx < list.length - 1 ? "다음 문장" : "기록 보기"}
          </button>
        </div>
      </div>
    </div>
  );
}
