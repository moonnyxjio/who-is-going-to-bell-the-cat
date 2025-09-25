import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data";

const RECORDS_KEY = "records";
const MASTER_KEY = "mastery_v1";

// 로컬스토리지 로드/세이브
const loadRecords = () => {
  try { return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]"); }
  catch { return []; }
};
const loadMastery = () => {
  try { return JSON.parse(localStorage.getItem(MASTER_KEY) || "{}"); }
  catch { return {}; }
};
const saveMastery = (obj) => localStorage.setItem(MASTER_KEY, JSON.stringify(obj));

// 가장 최근 기록만 남기기(같은 day, qid는 최신 ts로)
function pickLatestByQid(list) {
  const map = new Map();
  for (const r of list) {
    const key = r.qid;
    if (!map.has(key) || r.ts > map.get(key).ts) {
      map.set(key, r);
    }
  }
  return Array.from(map.values()).sort((a,b)=>a.qid - b.qid);
}

export default function Result() {
  const nav = useNavigate();
  const { state } = useLocation(); // { name, date, day }
  const name = state?.name || "";
  const date = state?.date || new Date().toISOString().slice(0,10);
  const day = state?.day || "day1";

  const [mastery, setMastery] = useState(() => loadMastery());

  // 이 학생, 이 Day의 최신 성적 모음
  const latest = useMemo(() => {
    const all = loadRecords();
    const mine = all.filter(r => r.name === name && r.day === day);
    return pickLatestByQid(mine);
  }, [name, day]);

  // 문제 목록(정답 기준)
  const dayQs = useMemo(() => QUESTIONS[day] || [], [day]);

  // qid -> 최신 기록 매핑
  const byQid = useMemo(() => {
    const m = new Map();
    latest.forEach(r => m.set(r.qid, r));
    return m;
  }, [latest]);

  // 오답만 추출해서 Exam 재시험에 넘길 데이터 생성
  const retryList = useMemo(() => {
    const arr = [];
    for (const q of dayQs) {
      const rec = byQid.get(q.id);
      if (!rec) { 
        // 아직 시험 안 본 문장도 오답으로 간주하여 포함
        arr.push(q);
        continue;
      }
      if ((rec.wrongIdxs || []).length > 0) arr.push(q);
    }
    return arr;
  }, [dayQs, byQid]);

  const total = dayQs.length;
  const correctCount = total - retryList.length;
  const allClear = total > 0 && correctCount === total;

  // (옵션) 자동 배지 지급: 모든 문장 통과 시 저장
  useEffect(() => {
    if (!name) return;
    if (!allClear) return;
    const next = loadMastery();
    next[name] = next[name] || {};
    // 이 Day의 모든 qid를 완료로 세팅
    next[name][day] = dayQs.map(q => q.id);
    saveMastery(next);
    setMastery(next);
  }, [name, allClear, day, dayQs]);

  const grantBadgeManually = () => {
    if (!name) return;
    const next = loadMastery();
    next[name] = next[name] || {};
    next[name][day] = dayQs.map(q => q.id);
    saveMastery(next);
    setMastery(next);
    alert("배지를 지급했습니다! ✅");
  };

  const goRetryWrong = () => {
    if (!retryList.length) {
      alert("오답이 없습니다. 훌륭해요! 🎉");
      return;
    }
    nav(`/exam/${day}`, { state: { name, date, day, retry: retryList } });
  };

  const goHome = () => nav("/");

  // 스타일 유틸
  const chip = (ok) =>
    `px-2 py-1 rounded text-sm font-semibold ${
      ok ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-lg shadow-xl rounded-2xl w-full max-w-3xl p-8">
        {/* 헤더 요약 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">시험 결과</h1>
          <div className="text-gray-700">
            <div><span className="font-semibold">이름:</span> {name || "—"}</div>
            <div><span className="font-semibold">날짜:</span> {date}</div>
            <div><span className="font-semibold">Day:</span> {String(day).toUpperCase()}</div>
          </div>
        </div>

        {/* 점수 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-semibold">
              총 {total}문장 · 정답 {correctCount} · 오답 {retryList.length}
            </div>
            {allClear ? (
              <div className="text-green-600 font-bold">All Clear ✅</div>
            ) : (
              <div className="text-red-600 font-bold">오답 재도전 필요 ❗</div>
            )}
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-3 bg-green-500"
              style={{ width: `${(correctCount / (total || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* 세부 목록 (수직 정렬) */}
        <div className="space-y-4">
          {dayQs.map((q) => {
            const rec = byQid.get(q.id);
            const wrong = new Set(rec?.wrongIdxs || []);
            const ok = rec && wrong.size === 0;
            return (
              <div key={q.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">Q{q.id}</div>
                  <span className={chip(ok)}>{ok ? "정답" : "오답"}</span>
                </div>

                {/* 한글 문제(노란 박스) */}
                <div className="bg-yellow-100 text-yellow-900 font-semibold rounded-md py-2 px-3 mb-3">
                  {q.koChunks?.join(" / ")}
                </div>

                {/* 기대 영어(토큰별 채점) */}
                <div className="flex flex-wrap gap-2">
                  {(rec?.enChunks || q.enChunks)?.map((token, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded ${
                        wrong.has(i)
                          ? "bg-red-200 text-red-700"
                          : "bg-green-200 text-green-700"
                      }`}
                    >
                      {token}
                    </span>
                  ))}
                </div>

                {/* 인식 문장 */}
                {rec?.user && (
                  <div className="mt-2 text-sm text-gray-700">
                    인식됨: <span className="font-semibold">{rec.user}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 버튼들 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow hover:opacity-90 transition"
            onClick={goRetryWrong}
          >
            틀린 것만 다시 말하기
          </button>
          <button
            className="w-full py-3 rounded-xl font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition"
            onClick={goHome}
          >
            처음으로
          </button>
          {!allClear && (
            <button
              className="w-full py-3 rounded-xl font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition md:col-span-2"
              onClick={grantBadgeManually}
            >
              (관리자) 배지 수동 지급
            </button>
          )}
          {allClear && (
            <button
              className="w-full py-3 rounded-xl font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition md:col-span-2"
              onClick={() => nav("/badges")}
            >
              배지 보관함 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
