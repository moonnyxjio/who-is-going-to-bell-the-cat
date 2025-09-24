// src/pages/Exam.js
import React, { useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data";

// normalize & tokenize
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const tokenize = (s) => norm(s).split(" ").filter(Boolean);

// STT
const useSTT = () => {
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
    try { rec.start(); } catch { setListening(false); }
  };
  const stop = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR && SR.stop) SR.stop();
    } catch {}
    setListening(false);
  };
  return { listening, start, stop };
};

export default function Exam() {
  const nav = useNavigate();
  const { day } = useParams();
  const { state } = useLocation(); // { name, date, retry? }
  const [idx, setIdx] = useState(0);
  const [userSaid, setUserSaid] = useState("");
  const [graded, setGraded] = useState(null); // { wrongIdxs, score, expectedTokens }
  const { listening, start, stop } = useSTT();

  const source = useMemo(() => {
    // 남은 오답만 재시험 모드
    if (state?.retry && Array.isArray(state.retry) && state.retry.length) return state.retry;
    return QUESTIONS[day] || [];
  }, [day, state]);

  const q = source[idx];

  if (!q) {
    return (
      <div className="container">
        <div className="card">
          <h2>문제가 없어요</h2>
          <div className="nav"><button className="btn" onClick={()=>nav("/")}>처음으로</button></div>
        </div>
      </div>
    );
  }

  const gradeNow = (spoken) => {
    const expectedTokens = tokenize(q.enChunks.join(" "));
    const userTokens = tokenize(spoken);
    const wrongIdxs = [];
    expectedTokens.forEach((exp, i) => {
      const user = userTokens[i] || "";
      if (user === exp) return;
      if (user + "s" === exp || user === exp + "s") return;
      wrongIdxs.push(i);
    });
    const score = expectedTokens.length - wrongIdxs.length;

    // 기록 저장
    const rec = {
      name: state?.name || "",
      date: state?.date || new Date().toISOString().slice(0, 10),
      day,
      qid: q.id,
      koChunks: q.koChunks,
      enChunks: expectedTokens,
      full: q.full,
      user: spoken,
      wrongIdxs,
      totalChunks: expectedTokens.length,
      score,
      ts: Date.now(),
    };
    const prev = JSON.parse(localStorage.getItem("records") || "[]");
    localStorage.setItem("records", JSON.stringify([rec, ...prev]));

    setGraded({ wrongIdxs, score, expectedTokens });
  };

  const handleNext = () => {
    if (idx < source.length - 1) {
      setIdx(idx + 1);
      setUserSaid("");
      setGraded(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      nav("/records", { state: { name: state?.name, day } });
    }
  };

  const retryThis = () => {
    setUserSaid("");
    setGraded(null);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 800 }}>
        <h1 className="title">{String(day).toUpperCase()} 말하기 시험 ({idx+1}/{source.length})</h1>
        <div className="muted" style={{ marginBottom: 6 }}>{q.koChunks?.join(" / ")}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{q.full}</div>

        {/* 말하기 컨트롤 */}
        <div className="nav" style={{ gap: 8 }}>
          {!listening ? (
            <button className="btn primary" onClick={() => start((txt)=>{ setUserSaid(txt); gradeNow(txt); })}>
              말하기 (자동 채점)
            </button>
          ) : (
            <button className="btn danger" onClick={stop}>중지</button>
          )}
          <button className="btn" onClick={retryThis}>이 문장 다시</button>
        </div>

        {/* 인식 결과 */}
        {userSaid && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="muted">인식된 문장</div>
            <div style={{ marginTop: 6 }}>{userSaid}</div>
          </div>
        )}

        {/* 채점 결과: 청크별 색상 */}
        {graded && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="muted" style={{ marginBottom: 6 }}>
              점수: {graded.score}/{graded.expectedTokens.length}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {graded.expectedTokens.map((w, i) => (
                <span
                  key={i}
                  style={{
                    padding: "3px 8px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: graded.wrongIdxs.includes(i) ? "#ff6b6b" : "#22c55e",
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 다음 문장 수동 진행 */}
        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => nav("/")}>처음으로</button>
          <button className="btn" disabled={!graded} onClick={handleNext}>
            {idx < source.length - 1 ? "다음 문장" : "시험 종료"}
          </button>
        </div>
      </div>
    </div>
  );
}
