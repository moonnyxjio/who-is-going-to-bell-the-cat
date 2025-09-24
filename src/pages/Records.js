// src/pages/Records.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data";
import { isAdminSession } from "../auth";

// (아래 내용은 기존 너의 Records.js에서 사용하던 구현을 그대로 둔 상태로 가드만 추가)
// 만약 내 이전 버전(관리자 삭제/필터/배지 포함)으로 쓰고 있다면, 상단 가드만 추가하면 돼.

export default function Records() {
  const nav = useNavigate();

  if (!isAdminSession()) {
    return (
      <div className="container">
        <div className="card">
          <h2>관리자 전용 페이지</h2>
          <p className="muted">접근 권한이 없습니다. 먼저 관리자 로그인을 해주세요.</p>
          <div className="nav"><button className="btn" onClick={()=>nav("/admin", { state:{ from:"/records" }})}>관리자 로그인</button></div>
        </div>
      </div>
    );
  }

  // ----- 아래는 네가 쓰던 기존 Records 본문을 그대로 넣어두면 됨 -----
  // (여기에는 필터/삭제/배지 요약 등 네가 쓰던 구현을 유지)
  // ... 기존 구현 붙여넣기 ...
  return (
    <div className="container">
      <div className="card"><h2>Records 본문을 여기 넣어주세요 (기존 코드 유지)</h2>
        <div className="nav"><button className="btn" onClick={()=>nav("/")}>처음으로</button></div>
      </div>
    </div>
  );
}
