// src/auth.js
export const ADMIN_PIN = "2468";

// ------- Admin session -------
export const isAdminSession = () => sessionStorage.getItem("admin_ok") === "1";
export const setAdminSession = (ok) => {
  if (ok) sessionStorage.setItem("admin_ok", "1");
  else sessionStorage.removeItem("admin_ok");
};

// ------- Student session -------
const STUDENT_KEY = "student_name";
export const getStudentName = () => sessionStorage.getItem(STUDENT_KEY) || "";
export const setStudentName = (name) => {
  if (name?.trim()) sessionStorage.setItem(STUDENT_KEY, name.trim());
};
export const clearStudentName = () => sessionStorage.removeItem(STUDENT_KEY);
