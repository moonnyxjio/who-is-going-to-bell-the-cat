// src/tts.js
let cachedVoices = [];

function loadVoices() {
  cachedVoices = window.speechSynthesis.getVoices();
  if (!cachedVoices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

export function speak(text, { rate = 1, pitch = 1, lang = "en-US" } = {}) {
  if (!window.speechSynthesis) return;
  loadVoices();
  window.speechSynthesis.cancel(); // 이전 발화 중지

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = pitch;

  // 영어 여성 보이스 우선 매칭
  const preferred =
    cachedVoices.find(v => /en/i.test(v.lang) && /female|samantha|victoria|joanna|jenny/i.test(v.name)) ||
    cachedVoices.find(v => /en/i.test(v.lang));
  if (preferred) u.voice = preferred;

  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}
