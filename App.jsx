import { useState, useCallback } from "react";
import { C, font, TABS } from "./constants.js";
import { callClaude }    from "./api.js";
import { prepareImage }  from "./imageUtils.js";
import { Spinner, ErrorBanner } from "./components/UI.jsx";
import {
  AnalysisPanel, CaptionsPanel, HashtagsPanel,
  StoryPanel,    PalettePanel,  StylesPanel,
} from "./components/Panels.jsx";

// ── Prompts ───────────────────────────────────────────────────────────────────
const STAGE1_PROMPT = `Analyze this image carefully. Return ONLY this JSON (fill real values):
{"primaryEmotion":"Joy","secondaryEmotions":["Warmth","Connection","Delight"],"emotionConfidence":88,"energyLevel":72,"contextConfidence":91,"trendScore":78,"emotionalNarrative":"One genuine sentence describing the emotional story of this moment.","scene":"Describe the actual scene","socialContext":"Describe social context","colorMood":"Describe color mood","trendAesthetic":"Describe trend aesthetic","bodyLanguage":"Describe body language","culturalSignals":"Describe cultural signals","timeOfDay":"Morning/Afternoon/Evening/Night","overallMomentScore":85}`;

const stage2Prompt = (emotion, scene) =>
  `Primary emotion: "${emotion}", scene: "${scene}". Return ONLY this JSON:
{"captions":["lyrical poetic caption 1-2 sentences","punchy memorable max 10 words","storytelling narrative 2-3 sentences","trending relatable with relevant emoji","minimal powerful 3-6 words"],"hashtags":["#Tag1","#Tag2","#Tag3","#Tag4","#Tag5","#Tag6","#Tag7","#Tag8"],"platformStrategy":"Two sentences on deploying this content across Instagram, TikTok, and LinkedIn."}`;

const stage3Prompt = (emotion, scene) =>
  `Image emotion: ${emotion}, scene: ${scene}. Return ONLY this JSON:
{"story":{"frames":[{"title":"Opening Frame","description":"visual framing of the start","caption":"opening micro-caption"},{"title":"Emotional Peak","description":"the climax moment description","caption":"peak emotion micro-caption"},{"title":"Resolution","description":"how the story resolves visually","caption":"closing micro-caption"}]},"palette":{"colors":["#E8A87C","#F7DC6F","#85C1E9","#A9CCE3","#D7BDE2"],"analysis":"Two sentences on the emotional meaning of these specific colors.","mood":"Energetic","temperature":"Warm"},"styles":[{"name":"Style 1","emoji":"🌟","styleName":"Vivid Cinematic","description":"Rich saturated film look with dramatic lighting.","keywords":["cinematic","vivid","dramatic"],"prompt":"cinematic photography, golden hour, vibrant colors, bokeh, 35mm film, high contrast, professional lighting, award-winning"},{"name":"Style 2","emoji":"🎞","styleName":"Film Grain","description":"Vintage analog warmth with grain texture.","keywords":["grain","analog","muted"],"prompt":"vintage film photography, grain texture, muted warm tones, kodak portra 400, soft shadows, nostalgic, analog"},{"name":"Style 3","emoji":"🌊","styleName":"Soft Ethereal","description":"Dreamy pastel softness and hazy light.","keywords":["soft","dreamy","pastel"],"prompt":"soft dreamy photography, pastel tones, overexposed, hazy light, ethereal, lifestyle photography, light and airy"},{"name":"Style 4","emoji":"⚡","styleName":"High Contrast","description":"Bold graphic look with deep blacks.","keywords":["bold","graphic","stark"],"prompt":"high contrast black and white photography, deep shadows, bright highlights, graphic composition, stark, editorial"}]}`;

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,     setPhase]     = useState("upload");
  const [imgSrc,    setImgSrc]    = useState(null);
  const [loadMsg,   setLoadMsg]   = useState("");
  const [results,   setResults]   = useState(null);
  const [activeTab, setActiveTab] = useState("analysis");
  const [error,     setError]     = useState(null);
  const [dragOver,  setDragOver]  = useState(false);

  const run = useCallback(async (file) => {
    if (!file) return;

    // Basic extension check — never show error for plausible image extensions
    const ext = (file.name || "").split(".").pop().toLowerCase();
    const imgExts = ["jpg","jpeg","png","gif","webp","heic","heif","avif","bmp","tiff","tif","jfif"];
    if (!file.type.startsWith("image/") && !imgExts.includes(ext) && file.type !== "") {
      setError("Please upload an image file (JPG, PNG, WEBP, HEIC, etc.)");
      return;
    }

    setError(null);
    setImgSrc(URL.createObjectURL(file));
    setPhase("analyzing");

    try {
      // ── Prepare image: compress to <4 MB, normalise MIME ──
      setLoadMsg("Preparing image (compressing if needed)…");
      const { b64, mime } = await prepareImage(file);
      const imgBlock = { type: "image", source: { type: "base64", media_type: mime, data: b64 } };

      // ── Stage 1: Emotion & Context ──
      setLoadMsg("Detecting emotions and reading the scene…");
      const a = await callClaude(
        "You are EmoVision's Emotional Intelligence Engine. Return ONLY valid JSON. No markdown, no extra text.",
        [imgBlock, { type: "text", text: STAGE1_PROMPT }]
      );

      // ── Stage 2: Captions & Hashtags ──
      setLoadMsg("Writing captions that capture the feeling…");
      const c = await callClaude(
        "You are EmoVision's Narrative Engine. Return ONLY valid JSON. No markdown.",
        [imgBlock, { type: "text", text: stage2Prompt(a.primaryEmotion, a.scene) }]
      );

      // ── Stage 3: Story Arc, Palette, Styles ──
      setLoadMsg("Building story arc and style directions…");
      const cr = await callClaude(
        "You are EmoVision's Creative Director. Return ONLY valid JSON. No markdown.",
        [imgBlock, { type: "text", text: stage3Prompt(a.primaryEmotion, a.scene) }]
      );

      setResults({
        analysis:         a,
        captions:         c.captions,
        hashtags:         c.hashtags,
        platformStrategy: c.platformStrategy,
        story:            cr.story,
        palette:          cr.palette,
        styles:           cr.styles,
      });
      setPhase("results");

    } catch (err) {
      console.error("EmoVision error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      setPhase("upload");
    }
  }, []);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) run(f);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) run(f);
  };

  const reset = () => {
    setPhase("upload");
    setResults(null);
    setImgSrc(null);
    setError(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: font, background: C.paper, minHeight: "100vh", color: C.ink }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade              { animation: fadeIn 0.35s ease both; }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        button             { transition: opacity 0.15s; cursor: pointer; }
        button:hover       { opacity: 0.82; }
        ::-webkit-scrollbar       { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(245,242,236,0.96)", backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1.5rem", height: 52,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: C.ember, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>
            <span style={{ color: C.ember }}>Emo</span>Vision
          </span>
          <span style={{ fontSize: 10, background: C.ember, color: "#fff", padding: "2px 7px", borderRadius: 999, fontWeight: 700, letterSpacing: "0.08em" }}>AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {phase !== "upload" && (
            <button onClick={reset} style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
              padding: "6px 14px", fontSize: 12, fontWeight: 600, fontFamily: font, color: C.muted,
            }}>↩ New Image</button>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            {[["Upload", 0], ["Analyze", 1], ["Results", 2]].map(([label, i]) => {
              const done   = (i === 0 && phase !== "upload") || (i === 1 && phase === "results");
              const active = (i === 0 && phase === "upload") || (i === 1 && phase === "analyzing") || (i === 2 && phase === "results");
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, opacity: done || active ? 1 : 0.3 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                    background: done ? C.teal : active ? C.ember : C.border,
                    color: done || active ? "#fff" : C.muted,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                  }}>{done ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? C.ink : C.muted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── UPLOAD PHASE ── */}
      {phase === "upload" && (
        <div className="fade" style={{ maxWidth: 620, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: C.ember + "18", border: `1px solid ${C.ember}33`,
              borderRadius: 999, padding: "5px 14px", marginBottom: 18,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ember, display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ember }}>
                Emotion-Driven AI
              </span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
              Upload a photo.<br />
              <span style={{ color: C.ember }}>Feel the story.</span>
            </h1>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, margin: "0 auto", lineHeight: 1.75 }}>
              EmoVision reads the emotional meaning of your moment and generates captions, hashtags, story arcs, colour palettes, and style directions — automatically.
            </p>
          </div>

          {/* Upload zone — <label> wrapping hidden <input> ensures click works everywhere */}
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              display: "block", cursor: "pointer", marginBottom: 14,
              border: `2px dashed ${dragOver ? C.ember : C.border}`,
              borderRadius: 10, padding: "3rem 2rem", textAlign: "center",
              background: dragOver ? C.ember + "08" : C.surface,
              transition: "all 0.25s",
            }}>
            <input
              type="file"
              accept="image/*"
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onChange={handleFileInput}
            />
            <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Drop your image here</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>
              or click anywhere in this box to browse your files
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.ember, color: "#fff", borderRadius: 6,
              padding: "11px 28px", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase", pointerEvents: "none",
            }}>
              ↑ Choose Image
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: C.muted }}>
              JPG · PNG · WEBP · HEIC · GIF · up to any size (auto-compressed)
            </div>
          </label>

          <ErrorBanner message={error} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: error ? 14 : 0 }}>
            {[
              ["🧠","Emotion Analysis","27-state detection"],
              ["✍️","5 Captions","Poetic to punchy"],
              ["🔖","Hashtags","Trend-matched"],
              ["📖","Story Arc","3-frame narrative"],
              ["🎨","Colour Palette","Emotion-mapped"],
              ["✨","Style Prompts","AI gen-ready"],
            ].map(([e, l, d]) => (
              <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>{e}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ANALYZING PHASE ── */}
      {phase === "analyzing" && (
        <div className="fade" style={{ maxWidth: 520, margin: "0 auto", padding: "3rem 1.5rem" }}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "flex-start",
          }}>
            {imgSrc && (
              <img src={imgSrc} alt="Analyzing" style={{
                width: 110, height: 110, objectFit: "cover",
                borderRadius: 6, flexShrink: 0, border: `3px solid ${C.ember}`,
              }} />
            )}
            <div style={{ flex: 1 }}>
              <span style={{
                display: "inline-block", padding: "3px 11px", borderRadius: 999,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                background: C.ember + "22", color: C.ember, border: `1px solid ${C.ember}44`,
              }}>Analyzing</span>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: "10px 0 4px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                Reading the emotional truth of your moment
              </h2>
              <Spinner msg={loadMsg} />
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS PHASE ── */}
      {phase === "results" && results && (
        <div className="fade" style={{ maxWidth: 1040, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", alignItems: "start" }}>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {imgSrc && (
                <img src={imgSrc} alt="Analyzed" style={{
                  width: "100%", aspectRatio: "1", objectFit: "cover",
                  borderRadius: 6, border: `2px solid ${C.border}`,
                }} />
              )}
              <div style={{ background: C.ink, borderRadius: 6, padding: "1rem", color: "#fff" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                  Moment Score
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {results.analysis.overallMomentScore}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/100</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, lineHeight: 1.5 }}>
                  {results.analysis.emotionalNarrative}
                </div>
              </div>
              {[
                ["Primary",  results.analysis.primaryEmotion,   C.ember],
                ["Scene",    results.analysis.scene,             C.teal],
                ["Time",     results.analysis.timeOfDay,         C.gold],
                ["Trend",    results.analysis.trendAesthetic,    C.violet],
              ].map(([k, v, col]) => (
                <div key={k} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderLeft: `3px solid ${col}`, padding: "7px 11px", borderRadius: 4,
                }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
              <button onClick={reset} style={{
                background: "none", border: `1px solid ${C.border}`, borderRadius: 6,
                padding: 10, fontSize: 12, fontWeight: 600, fontFamily: font, color: C.muted,
              }}>
                ↩ Analyze Another Image
              </button>
            </div>

            {/* Tab area */}
            <div>
              <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 18, overflowX: "auto" }}>
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    background: "none", border: "none", fontFamily: font,
                    padding: "11px 14px", fontSize: 12, fontWeight: 700,
                    color:       activeTab === tab.id ? C.ember : C.muted,
                    borderBottom: activeTab === tab.id ? `2px solid ${C.ember}` : "2px solid transparent",
                    whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em",
                    display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s",
                  }}>
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>

              <div key={activeTab} className="fade">
                {activeTab === "analysis" && <AnalysisPanel  a={results.analysis} />}
                {activeTab === "captions" && <CaptionsPanel  captions={results.captions} />}
                {activeTab === "hashtags" && <HashtagsPanel  hashtags={results.hashtags} platformStrategy={results.platformStrategy} />}
                {activeTab === "story"    && <StoryPanel     story={results.story} />}
                {activeTab === "palette"  && <PalettePanel   palette={results.palette} />}
                {activeTab === "styles"   && <StylesPanel    styles={results.styles} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.5rem", textAlign: "center", marginTop: "3rem" }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>
          <span style={{ color: C.ember }}>Emo</span>Vision
        </span>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 10 }}>
          Emotion-Driven AI Creative Platform · Powered by Claude
        </span>
      </footer>
    </div>
  );
}

// Named import for ErrorBanner inside this file
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      padding: "11px 16px", background: "#fff0ed",
      border: `1px solid ${C.ember}55`, borderRadius: 6,
      color: C.ember, fontSize: 13, lineHeight: 1.5, marginBottom: 14,
    }}>
      ⚠️ {message}
    </div>
  );
}
