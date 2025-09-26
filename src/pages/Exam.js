import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QUESTIONS } from "../data";

// 소문자/기호 제거, 공백 정리
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (s) => norm(s).split(" ").filter(Boolean);

export default function Exam() {
  const nav = useNavigate();
  const { day } = useParams(); // URL의 :day (예: 1, 2, 3, 4)
  const { state } = useLocation(); // Home에서 넘겨준 { name }
  const studentName = state?.name || "";

  // data.js가 day1, day2 처럼 되어 있다고 가정
  const dayKey = useMemo(() => `day${day}`, [day]);
  const list = useMemo(() => QUESTIONS[dayKey] || [], [dayKey]);

  const [idx, setIdx] = useState(0);
  const q = list[idx];

  // 말하기 관련
  const [recognized, setRecognized] = useState(""); // 인식된 문장
  const [checking, setChecking] = useState(false);  // 채점 중/후 상태 표시용 트리거
  const [result, setResult] = useState(null);       // { wrongIdxs, expectedTokens, userTokens, score, total }
  const recogRef = useRef(null);

  // 음성인식 준비
  useEffect(() => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) {
      recogRef.current = null;
      return;
    }
    const recog = new R();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      setRecognized(text);
      // 말하기가 끝나면 자동으로 채점
      handleCheck(text);
    };
    recog.onerror = () => {
      setRecognized("");
    };
    recogRef.current = recog;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 말하기 시작
  const handleSpeak = () => {
    if (!recogRef.current) {
      alert("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해 주세요!");
      return;
    }
    setRecognized("");
    setResult(null);
    setChecking(false);
    try {
      recogRef.current.start();
    } catch (_) {
      // Safari 등에서 start 중복 호출 예외 무시
    }
  };

  // 채점: enChunks를 기준으로 토큰 비교
  const handleCheck = (textMaybe) => {
    const text = typeof textMaybe === "string" ? textMaybe : recognized;
    const expectedTokens = tokenize((q?.enChunks || []).join(" "));
    const userTokens = tokenize(text);
    const wrongIdxs = [];

    expectedTokens.forEach((exp, i) => {
      const user = userTokens[i] || "";
      if (user === exp) return;
      // s/es 가벼운 오차 허용 (선택)
      if (user + "s" === exp || user === exp + "s") return;
      wrongIdxs.push(i);
    });

    const score = expectedTokens.length - wrongIdxs.length;
    setResult({
      wrongIdxs,
      expectedTokens,
      userTokens,
      score,
      total: expectedTokens.length,
    });
    setChecking(true);
  };

  // 같은 문장 다시 시도
  const handleRetry = () => {
    setRecognized("");
    setResult(null);
    setChecking(false);
    handleSpeak();
  };

  // 기록 저장
  const saveRecord = () => {
    if (!result) return;
    const rec = {
      type: "SPEAK",
      name: studentName,
      date: new Date().toISOString().slice(0, 10),
      day: dayKey,
      qid: q.id,
      koChunks: q.koChunks,
      enChunks: result.expectedTokens,
      user: recognized,
      userTokens: result.userTokens,
      wrongIdxs: result.wrongIdxs,
      score: result.score,
      totalChunks: result.total,
      ts: Date.now(),
    };
    const prev = JSON.parse(localStorage.getItem("records") || "[]");
    localStorage.setItem("records", JSON.stringify([...prev, rec]));
  };

  // 다음 문장으로 이동 (기록 저장 후)
  const handleNext = () => {
    if (!result) {
      alert("먼저 말하기를 눌러 채점해 주세요.");
      return;
    }
    saveRecord();
    if (idx < list.length - 1) {
      setIdx(idx + 1);
      setRecognized("");
      setResult(null);
      setChecking(false);
    } else {
      alert("🎉 오늘 학습/시험을 마쳤습니다!");
      nav("/records", { state: { filter: { name: studentName, day: dayKey } } });
    }
  };

  if (!q) {
    return (
      <div className="container">
        <h1 className="title">문제가 없어요</h1>
        <div className="btn-group">
          <button className="btn" onClick={() => nav("/")}>
            처음으로
          </button>
          <button className="btn secondary" onClick={() => nav("/records")}>
            기록 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">
        문제 {idx + 1} / {list.length}
      </h1>

      {/* 시험은 한글만 보여줌 */}
      <p className="pill big">
        {q.koChunks?.join(" / ")}
      </p>

      {/* 말하기 & 채점 */}
      <div className="btn-group" style={{ marginTop: 12 }}>
        <button className="btn" onClick={handleSpeak}>말하기</button>
        <button className="btn secondary" onClick={() => handleCheck()}>채점하기</button>
        <button className="btn secondary" onClick={handleRetry}>다시 말하기</button>
        <button className="btn" onClick={handleNext}>다음 문장</button>
      </div>

      {/* 인식 결과 표시 */}
      <div className="panel">
        <div className="panel-title">인식된 문장</div>
        <div className="panel-body">{recognized || <span className="muted">아직 인식된 문장이 없어요.</span>}</div>
      </div>

      {/* 채점 결과(토큰별 칩 비교) */}
      {checking && result && (
        <div className="panel">
          <div className="panel-title">
            채점 결과 · 점수 {result.score} / {result.total}
          </div>
          <div className="panel-subtitle">정답(영어 토큰)</div>
          <div className="chips">
            {result.expectedTokens.map((tok, i) => {
              const wrong = result.wrongIdxs.includes(i);
              return (
                <span key={i} className={`chip ${wrong ? "bad" : "ok"}`}>
                  {tok}
                </span>
              );
            })}
          </div>

          <div className="panel-subtitle" style={{ marginTop: 8 }}>
            학생 토큰
          </div>
          <div className="chips">
            {result.userTokens.length ? (
              result.userTokens.map((tok, i) => (
                <span key={i} className="chip">
                  {tok}
                </span>
              ))
            ) : (
              <span className="muted">토큰이 없어요.</span>
            )}
          </div>
        </div>
      )}

      <div className="btn-group" style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={() => nav("/")}>처음으로</button>
        <button className="btn secondary" onClick={() => nav("/records")}>기록 보기</button>
      </div>
    </div>
  );
}
