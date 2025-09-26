// src/auth.js
// ───────────────────────────────────────────
// 관리자 세션 & PIN 관리 (최소 구성)
// AdminLogin, Badges 등에서 import 해서 씀
// ───────────────────────────────────────────

const ADMIN_STORAGE_KEY = "is_admin_session_v1";

// 👉 원하는 핀으로 바꿔도 됨 (예: "1234")
export const ADMIN_PIN = "jchi";

export const isAdminSession = () =>
  localStorage.getItem(ADMIN_STORAGE_KEY) === "1";

export const setAdminSession = (on) => {
  if (on) localStorage.setItem(ADMIN_STORAGE_KEY, "1");
  else localStorage.removeItem(ADMIN_STORAGE_KEY);
};

// 올바른 핀인지 확인하고 세션 ON
export const loginAdmin = (pin) => {
  const ok = String(pin) === String(ADMIN_PIN);
  setAdminSession(ok);
  return ok;
};

// 세션 OFF
export const logoutAdmin = () => setAdminSession(false);
