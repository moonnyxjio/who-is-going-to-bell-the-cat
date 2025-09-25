import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QUESTIONS } from "../data";

export default function Lesson() {
  const { day } = useParams();
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);

  const list = QUESTIONS[day] || [];
  const q = list[idx];

  if (!q) return <div className="container"><h2>학습할 문장이 없어요.</h2></div>;

  const handleNext = () => {
    if (idx < list.length - 1) {
      setIdx(idx + 1);
    } else {
      nav(`/exam/${day}`); // 학습 끝 → 시험으로 이동
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Day {day} 학습 {idx + 1}/{list.length}</h1>
        <p className="yellow">{q.koChunks.join(" / ")}</p>
        <p className="white">{q.enChunks.join(" ")}</p>

        <div className="nav">
          <button className="btn primary" onClick={handleNext}>
            {idx < list.length - 1 ? "다음 문장" : "시험 시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
