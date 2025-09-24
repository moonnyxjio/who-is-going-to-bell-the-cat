// src/pages/AdminLogin.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ADMIN_PIN, setAdminSession } from "../auth";

export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const [pin, setPin] = useState("");

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setAdminSession(true);
      alert("관리자 모드로 전환되었습니다.");
      const to = loc.state?.from || "/records";
      nav(to, { replace: true });
    } else {
      alert("PIN이 올바르지 않습니다.");
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ width: 420 }}>
        <h1 className="title">관리자 로그인</h1>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{
            padding: 12, marginTop: 12,
            borderRadius: 10, border: "1px solid #2e2e2e",
            background: "transparent", color: "#fff",
            width: "100%"
          }}
        />
        <div className="nav" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={handleLogin}>로그인</button>
          <button className="btn" onClick={() => nav("/")}>처음으로</button>
        </div>
      </div>
    </div>
  );
}
