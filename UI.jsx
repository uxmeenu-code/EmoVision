import { useState } from "react";
import { C, font } from "../constants.js";

export function Tag({ children, color = C.ember }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 11px", borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      background: color + "22", color, border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}

export function Bar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 999, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

export function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(text); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
      padding: "4px 12px", cursor: "pointer", fontSize: 11, color: C.muted, fontFamily: font,
    }}>
      📋 {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function Spinner({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
      <div style={{ position: "relative", width: 52, height: 52, margin: "0 auto 14px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${C.border}` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: C.ember, animation: "spin 0.8s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.violet, animation: "spin 1.4s linear infinite reverse" }} />
      </div>
      <p style={{ fontSize: 13, color: C.muted, maxWidth: 260, margin: "0 auto", lineHeight: 1.6 }}>{msg}</p>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: "11px 16px", background: "#fff0ed",
      border: `1px solid ${C.ember}55`, borderRadius: 6,
      color: C.ember, fontSize: 13, lineHeight: 1.5,
    }}>
      ⚠️ {message}
    </div>
  );
}
