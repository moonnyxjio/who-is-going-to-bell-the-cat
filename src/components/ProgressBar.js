// src/components/ProgressBar.js
import React from "react";

export default function ProgressBar({ now, total }) {
  const p = total > 0 ? Math.round((now/total)*100) : 0;
  return (
    <div style={{width:"100%", background:"#111926", borderRadius:999, overflow:"hidden", height:10}}>
      <div style={{
        width:`${p}%`, height:"100%",
        background:"linear-gradient(90deg,#22c55e,#16a34a)"
      }}/>
    </div>
  );
}
