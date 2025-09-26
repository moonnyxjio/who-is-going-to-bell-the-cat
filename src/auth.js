// src/auth.js

// 관리자 PIN 코드 (여기서 원하는 비밀번호로 바꿔도 됨)
export const ADMIN_PIN = "jchi";

// 세션 키
const ADMIN_SESSION_KEY = "is_admin_session";

// 현재 관리자 세션이 유효한지 확인
export const isAdminSession = () => {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
};

// 관리자 로그인 (세션 true로 저장)
export const loginAdmin = () => {
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
};

// 관리자 로그아웃
export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

// 세션 강제 세팅 (boolean 값으로 직접 지정 가능)
export const setAdminSession = (value) => {
  if (value) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};
