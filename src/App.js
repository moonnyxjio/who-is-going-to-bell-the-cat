// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Start from "./pages/Start";
import Learn from "./pages/Learn";
import Exam from "./pages/Exam";
import Records from "./pages/Records";
import Badges from "./pages/Badges";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import StudentHome from "./pages/StudentHome";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />

      {/* 학생 로그인/마이페이지 */}
      <Route path="/student" element={<StudentLogin />} />
      <Route path="/me" element={<StudentHome />} />

      {/* 학습 → 시험 흐름 */}
      <Route path="/learn/:day" element={<Learn />} />
      <Route path="/exam/:day" element={<Exam />} />

      {/* 관리자 */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/records" element={<Records />} />
      <Route path="/badges" element={<Badges />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
