// src/pages/Start.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminSession } from "../auth";
import { getStudentName } from "../auth";

export default function Start() {
  const nav = useNavigate();
  const [name, setName] = useState(() => getStudentName() || "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [admin, setAdmin] = useState(false);

  useEffect(() => setAdmin(isAdminSession()), []);

  const goLearn = (day) => {
    if (!name.trim()) {
      alert("학생 이름을 입력해 주세요.");
      return;
    }
    nav(`/learn/${day}`, { state: { name, date, day } });
  };

  return (
    <div className="container">
      <div className="card" style={{ width: "100%", maxWidth: 640 }}>
        <h1 className="title">Who’s going to bell the cat?</h1>
        <p className="subtitle">말하기 학습 → 시험 · 오답 재시험 · 뱃지</p>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            type="text"
            placeholder="학생 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #2e2e2e",
              background: "transparent",
              color: "#fff",
            }}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #2e2e2e",
              background: "transparent",
              color: "#fff",
            }}
          />
        </div>

        <div className="nav" style={{ marginTop: 16, flexWrap: "wrap", gap: 8 }}>
          <button className="btn primary" onClick={() => goLearn("day1")}>Day 1 시작</button>
          <button className="btn primary" onClick={() => goLearn("day2")}>Day 2 시작</button>
          <button className="btn primary" onClick={() => goLearn("day3")}>Day 3 시작</button>
          <button className="btn primary" onClick={() => goLearn("day4")}>Day 4 시작</button>
        </div>

        <div className="nav" style={{ marginTop: 8, flexWrap: "wrap", gap: 8 }}>
          {/* 관리자 페이지 버튼은 관리자 로그인시에만 노출 */}
          {admin && <button className="btn" onClick={() => nav("/records")}>기록 보기</button>}
          {admin && <button className="btn" onClick={() => nav("/badges")}>뱃지 보관함</button>}

          {/* 학생 마이페이지 진입용 */}
          <button className="btn" onClick={() => nav("/student")}>학생 로그인</button>
          <button className="btn" onClick={() => nav("/admin")}>관리자 로그인</button>
        </div>
      </div>
    </div>
  );
}
