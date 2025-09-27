// src/pages/Exam.js
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QUESTIONS } from "../data";
import { addRecord, uid, updateMasteryOnPerfect } from "../store";
import useSpeech from "../hooks/useSpeech";
import ProgressBar from "../components/ProgressBar";
import Toast from "../components/Toast";

const norm = (s) =>
  s.toLowerCase().replace(/[.,!?;:"'()]/g, "").replace(/\s+/g, " ").trim();
const tokenize = (s) => norm(s).split(" ").filter(Boolean);

export default function Exam() {
  const nav = useNavigate();
  const { day } = useParams();
  const { state } = useLocation(); // { name, date, questions?, originTotal? }
  const name = state?.name || "";
  const date = state?.date || new Date().toISOString().slice(0, 10);

  // 오답 재시험이면 state.questions, 아니면 전체
  const baseList = useMemo(
    () => (state?.questions?.length ? state.questions : (QUESTIONS[day] || [])),
    [day, state?.questions]
  );
  const originTotal =
    state?.originTotal || (QUESTIONS[day] || []).length || baseList.length;

  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState("");          // 인식된 문장 (표시용)
  const [colors, setColors] = useState([]);        // 각 토큰칸의 정오 표시
  const [badgeToast, setBadgeToast] = useState(null);

  const q = baseList[idx];
  const expectedTokens = useMemo(
    () => tokenize(q?.enChunks?.join(" ") || ""),
    [q]
  );

  // 말하기 시작/종료 → 자동 채점
  const { canUseSpeech, listening, start, stop, lastError } = useSpeech({
    lang: "en-US",
    interim: false,
    onResult: (text) => {
      setHeard(text);
      autoScore(text);
    },
  });

  if (!q) {
    return (
      <div className="container">
        <div className="card">
          <h2>문제가 없어요</h2>
          <div className="nav">
            <button className="btn" onClick={() => nav("/")}>처음으로</button>
          </div>
        </div>
      </div>
    );
  }

  // 정답 문장은 화면에 절대 출력하지 않는다.
  // 대신 "토큰칸(■)"을 기대 토큰 개수만큼 그리고, 맞으면 초록, 틀리면 빨강으로 표시.
  const autoScore = (text) => {
    const userTokens = tokenize(text);
    const colorArr = expectedTokens.map((tk, i) => {
      const user = userTokens[i] || "";
      const ok = user === tk || user + "s" === tk || user === tk + "s";
      return ok; // true(초록) / false(빨강)
    });
    setColors(colorArr);
  };

  const handleNext = () => {
    // 점수 저장 + 뱃지/숙련도
    const userTokens = tokenize(heard);
    const wrongIdxs = [];
    expectedTokens.forEach((tk, i) => {
      const user = userTokens[i] || "";
      if (!(user === tk || user + "s" === tk || user === tk + "s")) wrongIdxs.push(i);
    });
    const score = expectedTokens.length - wrongIdxs.length;

    const rec = {
      id: uid(),
      type: "SPEAK",
      name, date, day,
      qid: q.id,
      koChunks: q.koChunks,
      enChunks: expectedTokens,  // 저장은 하되 화면엔 노출하지 않음
      full: q.full,
      user: heard,
      wrongIdxs,
      totalChunks: expectedTokens.length,
      score,
      ts: Date.now(),
    };
    addRecord(rec);

    // 완벽 정답이면 숙련도 → Day 뱃지 체크
    if (wrongIdxs.length === 0) {
      const granted = updateMasteryOnPerfect(name, day, q.id, originTotal);
      if (granted) setBadgeToast(`🎉 ${name} — ${String(day).toUpperCase()} 뱃지 획득!`);
    }

    // 다음 문항
    setHeard("");
    setColors([]);
    if (idx < baseList.length - 1) {
      setIdx((i) => i + 1);
    } else {
      nav("/records", { state: { name, day } });
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">시험 · 문제 {idx + 1} / {baseList.length}</h1>

        {/* 오답 재시험일 때만 진행률 바 */}
        {state?.questions?.length ? (
          <div style={{ margin: "6px 0 12px" }}>
            <ProgressBar now={idx} total={baseList.length} />
          </div>
        ) : null}

        {/* 한글 프롬프트만 노출 */}
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        {/* 토큰칸(정답 비공개): 기대 토큰 개수만큼 네모칸을 그리고 정오색 표시 */}
        <div className="row" style={{ gap: 6, flexWrap: "wrap", margin: "14px 0 8px" }}>
          {expectedTokens.map((_, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 16, height: 16, borderRadius: 4,
                background: colors[i] === undefined
                  ? "#2b3442" // 아직 미채점(회색)
                  : colors[i]
                  ? "rgba(34,197,94,.9)" // 초록
                  : "rgba(239,68,68,.9)",   // 빨강
              }}
              title={`token ${i + 1}`}
            />
          ))}
        </div>

        {/* 인식된 문장(학생 피드백용) – 입력창 제거, 단순 표시만 */}
        <div
          style={{
            width: "100%", minHeight: 56, borderRadius: 12,
            background: "#0b1420", border: "1px solid #243042",
            padding: "12px 14px", color: "#cbd5e1", marginTop: 8
          }}
        >
          {heard || <span style={{ opacity: .5 }}>말하기 버튼을 눌러 답하세요</span>}
        </div>

        {/* 마이크 컨트롤만 제공 (타이핑 제거) */}
        <div className="nav">
          {canUseSpeech ? (
            listening
              ? <button className="btn danger" onClick={stop}>정지</button>
              : <button className="btn primary" onClick={() => { setHeard(""); setColors([]); start(); }}>말하기</button>
          ) : (
            <button className="btn danger" disabled>마이크를 사용할 수 없어요</button>
          )}
          <button className="btn" onClick={() => { setHeard(""); setColors([]); }}>다시 말하기</button>
          <button className="btn" onClick={handleNext} disabled={!heard}>다음 문장</button>
          <button className="btn" onClick={() => nav("/records", { state: { name, day } })}>기록 보기</button>
        </div>

        {/* 마이크 에러 표기(권한/HTTPS 등) */}
        {lastError && (
          <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>
            마이크 오류: {lastError}
          </div>
        )}
      </div>

      {badgeToast && <Toast text={badgeToast} onDone={() => setBadgeToast(null)} />}
    </div>
  );
}
