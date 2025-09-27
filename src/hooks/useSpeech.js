import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeech({ lang="en-US", interim=false, onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [lastError, setLastError] = useState("");
  const recogRef = useRef(null);
  const can = typeof window !== "undefined" && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  useEffect(() => {
    if (!can) return;
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new R();
    rec.lang = lang;
    rec.interimResults = interim;
    rec.continuous = false;        // 한 문장당 1회 결과
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const str = Array.from(e.results).map(r => r[0]?.transcript || "").join(" ");
      onResult?.(str);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setLastError(e?.error || "unknown");
      setListening(false);
    };

    recogRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, [can, lang, interim, onResult]);

  const start = useCallback(() => {
    setLastError("");
    if (!recogRef.current) return;
    try {
      recogRef.current.start();    // iOS는 버튼 클릭 같은 사용자 제스처 직후에만 허용
      setListening(true);
    } catch (e) {
      setListening(false);
      setLastError(e?.message || "start failed");
    }
  }, []);

  const stop = useCallback(() => {
    if (!recogRef.current) return;
    try { recogRef.current.stop(); } catch {}
    setListening(false);
  }, []);

  return { canUseSpeech: !!can, listening, start, stop, lastError };
}
