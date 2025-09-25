import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Start from "./pages/Start";
import Lesson from "./pages/Lesson";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import Records from "./pages/Records";
import Badges from "./pages/Badges";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 첫 화면 */}
        <Route path="/" element={<Start />} />

        {/* 학습 페이지 → 시험 페이지 → 결과 페이지 */}
        <Route path="/lesson/:day" element={<Lesson />} />
        <Route path="/exam/:day" element={<Exam />} />
        <Route path="/result" element={<Result />} />

        {/* 기록, 뱃지, 관리자 */}
        <Route path="/records" element={<Records />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/admin" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}
