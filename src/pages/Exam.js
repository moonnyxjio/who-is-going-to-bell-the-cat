import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { QUESTIONS } from "../data";

const norm = (s) =>
  s.toLowerCase().replace(/[.,!?;:"'()]/g, "").replace(/\s+/g, " ").trim();
const tokenize = (s) => norm(s).split(" ").filter(Boolean);

export default function Exam() {
  const { day } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);
  const [spoken, setSpoken] = useState("");
  const [result, setResult] = useState(null);

  const list = useMemo(() => QUESTIONS[day] || [], [day]);
  const q = list[idx];

  if (!q) return <div className="container"><h2>시험 문제가 없어요.</h2></div>;

  // SpeechRecognition 연결
  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않아요 😢");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSpoken(text);
      checkAnswer(text);
    };
    recog.start();
  };

  // 자동 채점
  const checkAnswer = (text) => {
    const userTokens = tokenize(text);
    const expectedTokens = tokenize(q.enChunks.join(" "));
    const wrongIdxs = [];

    expectedTokens.forEach((exp, i) => {
      const user = userTokens[i] || "";
      if (user === exp) return;
      if (user + "s" === exp || user === exp + "s") return; // 복수형 허용
      wrongIdxs.push(i);
    });

    setResult({ expected: expectedTokens, wrongIdxs });
  };

  const handleNext = () => {
    if (idx < list.length - 1) {
      setIdx(idx + 1);
      setSpoken("");
      setResult(null);
    } else {
      nav("/result", { state: { name: state?.name, date: state?.date, day } });
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Day {day} 시험 {idx + 1}/{list.length}</h1>
        <p className="yellow">{q.koChunks.join(" / ")}</p>

        <div className="nav">
          <button className="btn primary" onClick={startSpeech}>🎤 말하기</button>
        </div>

        {spoken && (
          <div style={{ marginTop: 16 }}>
            <p>👉 인식된 문장: <b>{spoken}</b></p>
            <p>
              {result?.expected.map((word, i) => (
                <span
                  key={i}
                  style={{
                    color: result.wrongIdxs.includes(i) ? "red" : "lime",
                    marginRight: 4,
                    fontWeight: 600,
                  }}
                >
                  {word}
                </span>
              ))}
            </p>
            <button className="btn" onClick={handleNext}>
              {idx < list.length - 1 ? "다음 문제" : "시험 끝내기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
