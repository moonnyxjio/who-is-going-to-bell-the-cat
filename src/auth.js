// src/auth.js
const ADMIN_PIN = "jchi"; // 👉 네가 원하는 PIN으로 바꿔

export function loginAdmin(pin) {
  if (pin === ADMIN_PIN) {
    localStorage.setItem("isAdmin", "true");
    return true;
  }
  return false;
}

export function logoutAdmin() {
  localStorage.removeItem("isAdmin");
}

export function isAdminSession() {
  return localStorage.getItem("isAdmin") === "true";
}
