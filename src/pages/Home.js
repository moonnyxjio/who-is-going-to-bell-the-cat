// src/pages/Start.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const nav = useNavigate();
  const [name, setName] = useState(sessionStorage.getItem("name") || "");
  const [date, setDate] = useState(
    sessionStorage.getItem("date") || new Date().toISOString().slice(0, 10)
  );

  // 입력값 유지
  useEffect(() => {
    sessionStorage.setItem("name", name);
  }, [name]);
  useEffect(() => {
    sessionStorage.setItem("date", date);
  }, [date]);

  const goLearn = (day) => {
    if (!name.trim()) {
      alert("학생 이름을 입력해주세요.");
      return;
    }
    nav(`/learn/${day}`, { state: { name, date, day } });
  };

  const goRecords = () => nav("/records");
  const goBadges = () => nav("/badges");
  const goAdmin = () => nav("/admin");

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 1100 }}>
        <h1 className="title">🎤 말하기 학습 & 시험</h1>

        {/* 입력 영역 */}
        <div className="row" style={{ gap: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div className="subtitle">이름</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="학생 이름을 입력하세요"
            />
          </div>
          <div style={{ width: 320 }}>
            <div className="subtitle">날짜</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Day 선택 */}
        <div className="subtitle" style={{ marginTop: 20 }}>
          Day 선택
        </div>
        <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => goLearn("day1")}>
            Day 1
          </button>
          <button className="btn" onClick={() => goLearn("day2")}>
            Day 2
          </button>
          <button className="btn" onClick={() => goLearn("day3")}>
            Day 3
          </button>
          <button className="btn" onClick={() => goLearn("day4")}>
            Day 4
          </button>
        </div>

        {/* 바로가기 */}
        <div className="nav" style={{ marginTop: 16 }}>
          <button className="btn" onClick={goRecords}>
            기록 보기
          </button>
          <button className="btn" onClick={goBadges}>
            뱃지 보관함
          </button>
          <button className="btn" onClick={goAdmin}>
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
