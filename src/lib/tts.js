// src/lib/tts.js
export const canSpeak = () => "speechSynthesis" in window;

const getVoice = (langHint="en") => {
  const voices = window.speechSynthesis.getVoices();
  // 영어 우선 탐색
  const prefer = voices.find(v => v.lang?.toLowerCase().startsWith(langHint))
             || voices.find(v => v.lang?.toLowerCase().startsWith("en"))
             || voices[0];
  return prefer || null;
};

export const speak = (text, { rate=0.8, pitch=1, lang="en-US", onend } = {}) => {
  if (!canSpeak()) return () => {};
  window.speechSynthesis.cancel();
  const uttr = new SpeechSynthesisUtterance(text);
  uttr.rate = rate;     // 0.1~10 (느리게: 0.6~0.8, 아주 느리게: 0.4~0.5)
  uttr.pitch = pitch;
  uttr.lang = lang;
  const voice = getVoice("en");
  if (voice) uttr.voice = voice;
  uttr.onend = onend || null;
  window.speechSynthesis.speak(uttr);
  return () => window.speechSynthesis.cancel();
};

// 청크용(항상 느리게)
export const speakSlow = (text) => speak(text, { rate: 0.6 });
export const speakVerySlow = (text) => speak(text, { rate: 0.45 });
