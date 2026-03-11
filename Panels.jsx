import { useState } from "react";
import { C, font, emoGrad } from "../constants.js";
import { Bar, CopyBtn, Tag } from "./UI.jsx";

/* ── Analysis Panel ── */
export function AnalysisPanel({ a }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 6, background: emoGrad(a.primaryEmotion), padding: "1.5rem", color: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, marginBottom: 8 }}>
          Emotional Fingerprint™
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
          {a.primaryEmotion}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 12, lineHeight: 1.5 }}>
          {a.emotionalNarrative}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(a.secondaryEmotions || []).map((e) => (
            <span key={e} style={{ background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
              {e}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: C.ink, borderRadius: 6, padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Bar label="Emotion"   value={a.emotionConfidence}  color={C.ember}  />
        <Bar label="Energy"    value={a.energyLevel}        color={C.gold}   />
        <Bar label="Context"   value={a.contextConfidence}  color={C.teal}   />
        <Bar label="Trend Fit" value={a.trendScore}         color={C.violet} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          ["Scene",         a.scene],
          ["Context",       a.socialContext],
          ["Color Mood",    a.colorMood],
          ["Trend Style",   a.trendAesthetic],
          ["Body Language", a.bodyLanguage],
          ["Time of Day",   a.timeOfDay],
        ].map(([k, v]) => (
          <div key={k} style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "9px 11px", borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Captions Panel ── */
export function CaptionsPanel({ captions }) {
  const [active, setActive] = useState(0);
  const labels = ["Poetic", "Punchy", "Story", "Trending", "Minimal"];
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ background: C.ink, padding: "0.75rem 1rem", display: "flex", gap: 6, overflowX: "auto" }}>
        {labels.map((l, i) => (
          <button key={l} onClick={() => setActive(i)} style={{
            background: active === i ? C.ember : "rgba(255,255,255,0.07)",
            color: active === i ? "#fff" : "rgba(255,255,255,0.5)",
            border: "none", borderRadius: 999, padding: "5px 14px", fontSize: 11,
            fontWeight: 700, cursor: "pointer", fontFamily: font,
            letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: "1.5rem" }}>
        <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 14, color: C.ink }}>
          {captions?.[active] ?? "—"}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CopyBtn text={captions?.[active] ?? ""} />
        </div>
      </div>
    </div>
  );
}

/* ── Hashtags Panel ── */
export function HashtagsPanel({ hashtags, platformStrategy }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>
            Hashtags
          </span>
          <CopyBtn text={(hashtags || []).join(" ")} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(hashtags || []).map((h) => (
            <span key={h}
              onClick={() => { try { navigator.clipboard.writeText(h); } catch (_) {} }}
              title="Click to copy"
              style={{
                background: C.ember + "15", color: C.ember,
                border: `1px solid ${C.ember}33`, padding: "5px 13px",
                borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
              {h}
            </span>
          ))}
        </div>
      </div>
      {platformStrategy && (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "1.25rem" }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Platform Strategy
          </div>
          <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.65 }}>{platformStrategy}</p>
        </div>
      )}
    </div>
  );
}

/* ── Story Panel ── */
export function StoryPanel({ story }) {
  const cols = [C.ember, C.gold, C.teal];
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ background: C.ink, padding: "0.85rem 1.25rem" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Visual Story Arc
        </span>
      </div>
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 16 }}>
        {(story?.frames || []).map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6, flexShrink: 0,
              background: cols[i] + "22", border: `2px solid ${cols[i]}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: cols[i],
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 5 }}>
                {f.description}
              </div>
              <div style={{ fontSize: 12, color: cols[i], fontStyle: "italic" }}>
                "{f.caption}"
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Palette Panel ── */
export function PalettePanel({ palette }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ display: "flex", height: 90 }}>
        {(palette?.colors || []).map((col, i) => (
          <div key={i}
            title={`Click to copy ${col}`}
            onClick={() => { try { navigator.clipboard.writeText(col); } catch (_) {} }}
            style={{
              flex: 1, background: col, cursor: "pointer",
              display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 5,
            }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
              {col}
            </span>
          </div>
        ))}
      </div>
      <div style={{ padding: "1.25rem" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{palette?.analysis}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Tag color={C.teal}>{palette?.mood}</Tag>
          <Tag color={C.violet}>{palette?.temperature}</Tag>
        </div>
      </div>
    </div>
  );
}

/* ── Styles Panel ── */
const STYLE_GRADS = [
  "linear-gradient(135deg,#ff9a3c,#ff4d1c)",
  "linear-gradient(135deg,#7b2fff,#ff006e)",
  "linear-gradient(135deg,#00d4b4,#0099ff)",
  "linear-gradient(135deg,#f5c842,#ff9a3c)",
];

export function StylesPanel({ styles }) {
  const [active, setActive] = useState(0);
  const s = (styles || [])[active];
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {(styles || []).map((st, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            flex: 1, padding: "10px 6px", border: "none", cursor: "pointer", fontFamily: font,
            background: active === i ? C.ink : C.surface,
            color:      active === i ? "#fff" : C.muted,
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            borderRight: i < styles.length - 1 ? `1px solid ${C.border}` : "none",
            transition: "all 0.2s",
          }}>
            {st.name || `Style ${i + 1}`}
          </button>
        ))}
      </div>
      {s && (
        <div style={{ padding: "1.5rem" }}>
          <div style={{ height: 84, borderRadius: 6, background: STYLE_GRADS[active], marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
            {s.emoji}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.styleName}</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{s.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {(s.keywords || []).map((k) => (
              <span key={k} style={{ background: C.paper, border: `1px solid ${C.border}`, padding: "2px 10px", borderRadius: 999, fontSize: 11, color: C.muted }}>
                {k}
              </span>
            ))}
          </div>
          <div style={{ background: C.ink, borderRadius: 4, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Generation Prompt
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontFamily: "monospace", lineHeight: 1.6 }}>
              {s.prompt}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <CopyBtn text={s.prompt || ""} />
          </div>
        </div>
      )}
    </div>
  );
}
