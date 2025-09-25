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

  if (!q) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-700">시험 문제가 없어요.</h2>
      </div>
    );
  }

  // SpeechRecognition
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

  // 채점
  const checkAnswer = (text) => {
    const userTokens = tokenize(text);
    const expectedTokens = tokenize(q.enChunks.join(" "));
    const wrongIdxs = [];

    expectedTokens.forEach((exp, i) => {
      const user = userTokens[i] || "";
      if (user === exp) return;
      if (user + "s" === exp || user === exp + "s") return;
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
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-lg shadow-xl rounded-2xl w-full max-w-2xl p-8">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Day {day} 시험 {idx + 1} / {list.length}
        </h1>

        {/* 문제 (한글만 보여줌) */}
        <div className="bg-yellow-100 text-yellow-900 font-semibold text-lg text-center py-3 px-4 rounded-lg mb-6 shadow-inner">
          {q.koChunks.join(" / ")}
        </div>

        {/* 말하기 버튼 */}
        <div className="flex justify-center mb-6">
          <button
            className="px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:opacity-90 transition"
            onClick={startSpeech}
          >
            🎤 말하기
          </button>
        </div>

        {/* 결과 */}
        {spoken && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              👉 인식된 문장: <span className="font-semibold">{spoken}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-lg font-bold">
              {result?.expected.map((word, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded ${
                    result.wrongIdxs.includes(i)
                      ? "bg-red-200 text-red-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold shadow hover:bg-gray-900 transition"
                onClick={handleNext}
              >
                {idx < list.length - 1 ? "다음 문제" : "시험 끝내기"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
