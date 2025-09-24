// src/pages/StudentLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setStudentName } from "../auth";

export default function StudentLogin() {
  const nav = useNavigate();
  const [name, setName] = useState("");

  const go = () => {
    if (!name.trim()) return alert("이름을 입력해 주세요.");
    setStudentName(name.trim());
    nav("/me");
  };

  return (
    <div className="container">
      <div className="card" style={{ width: 420 }}>
        <h1 className="title">학생 로그인</h1>
        <input
          type="text"
          placeholder="이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 12, marginTop: 12,
            borderRadius: 10, border: "1px solid #2e2e2e",
            background: "transparent", color: "#fff",
            width: "100%"
          }}
        />
        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={go}>내 페이지로</button>
          <button className="btn" onClick={() => nav("/")}>처음으로</button>
        </div>
      </div>
    </div>
  );
}
