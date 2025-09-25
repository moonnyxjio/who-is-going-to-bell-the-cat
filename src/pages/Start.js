import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const nav = useNavigate();

  const handleStart = (day) => {
    if (!name.trim()) {
      alert("이름을 입력하세요!");
      return;
    }
    nav(`/lesson/${day}`, { state: { name, date } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-lg shadow-xl rounded-2xl w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🎤 말하기 학습 & 시험
        </h1>

        {/* 이름 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="학생 이름을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        {/* 날짜 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>

        {/* Day 선택 */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
          Day 선택
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {["day1", "day2", "day3", "day4"].map((day, i) => (
            <button
              key={day}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-md hover:opacity-90 transition"
              onClick={() => handleStart(day)}
            >
              Day {i + 1}
            </button>
          ))}
        </div>

        {/* 네비게이션 */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => nav("/records")}
          >
            기록 보기
          </button>
          <button
            className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => nav("/badges")}
          >
            뱃지 보관함
          </button>
          <button
            className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => nav("/admin")}
          >
            관리자 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
