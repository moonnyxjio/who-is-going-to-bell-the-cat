// src/store.js
const REC_KEY = "records";
const MASTERY_KEY = "mastery_v1";  // { [name]: { [day]: [qid, qid, ...] } }
const BADGE_KEY = "badges_v1";     // { [name]: [{ day, ts }] }

export const loadJSON = (k, fb) => {
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); }
  catch { return fb; }
};
export const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/** ── Records ───────────────────────────────────────────────── */
export const getRecords = () => loadJSON(REC_KEY, []);
export const setRecords = (list) => saveJSON(REC_KEY, list);

export const addRecord = (rec) => {
  const list = getRecords();
  list.push(rec);
  setRecords(list);
  return rec;
};

export const deleteRecordById = (id) => {
  const list = getRecords().filter(r => r.id !== id);
  setRecords(list);
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/** ── Mastery / Badges ─────────────────────────────────────── */
export const getMastery = () => loadJSON(MASTERY_KEY, {});
export const setMastery = (m) => saveJSON(MASTERY_KEY, m);

export const getBadges = () => loadJSON(BADGE_KEY, {});
export const setBadges = (b) => saveJSON(BADGE_KEY, b);

/**
 * 문항 완벽 통과(오답 0) 시 숙련도 업데이트.
 * 모든 문항 통과하면 뱃지 자동 지급.
 */
export const updateMasteryOnPerfect = (name, day, qid, totalQuestionsOfDay) => {
  const m = getMastery();
  if (!m[name]) m[name] = {};
  if (!m[name][day]) m[name][day] = [];

  // qid 중복 없이 저장
  if (!m[name][day].includes(qid)) m[name][day].push(qid);
  setMastery(m);

  // 전부 통과 여부 확인 → 뱃지 지급
  const mastered = m[name][day].length;
  if (mastered >= totalQuestionsOfDay) {
    const b = getBadges();
    if (!b[name]) b[name] = [];
    // 동일 day 중복 지급 방지
    if (!b[name].some(x => x.day === day)) {
      b[name].push({ day, ts: Date.now() });
      setBadges(b);
      return true; // 새 배지 지급됨
    }
  }
  return false; // 아직 미지급
};
