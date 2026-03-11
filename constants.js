// Design tokens
export const C = {
  ink:     "#0a0a0f",
  paper:   "#f5f2ec",
  ember:   "#ff4d1c",
  gold:    "#f5c842",
  violet:  "#7b2fff",
  teal:    "#00d4b4",
  muted:   "#6b6b7a",
  border:  "#e2ddd6",
  surface: "#ffffff",
};

export const font = `"Helvetica Neue", Helvetica, Arial, sans-serif`;

// Emotion → gradient map
const EMO_GRAD = {
  joy:         "linear-gradient(135deg,#ff9a3c,#ff4d1c)",
  celebration: "linear-gradient(135deg,#f5c842,#ff9a3c)",
  love:        "linear-gradient(135deg,#ff6b9d,#ff4d1c)",
  happiness:   "linear-gradient(135deg,#ff9a3c,#ff4d1c)",
  happy:       "linear-gradient(135deg,#ff9a3c,#ff4d1c)",
  sadness:     "linear-gradient(135deg,#4a6fa5,#2c4a7c)",
  sad:         "linear-gradient(135deg,#4a6fa5,#2c4a7c)",
  nostalgia:   "linear-gradient(135deg,#8B7355,#c9a96e)",
  nostalgic:   "linear-gradient(135deg,#8B7355,#c9a96e)",
  excitement:  "linear-gradient(135deg,#7b2fff,#ff4d1c)",
  excited:     "linear-gradient(135deg,#7b2fff,#ff4d1c)",
  calm:        "linear-gradient(135deg,#00d4b4,#0099ff)",
  peaceful:    "linear-gradient(135deg,#00d4b4,#0099ff)",
  awe:         "linear-gradient(135deg,#1a1a2e,#7b2fff)",
  wonder:      "linear-gradient(135deg,#1a1a2e,#7b2fff)",
  anger:       "linear-gradient(135deg,#c0392b,#e74c3c)",
  angry:       "linear-gradient(135deg,#c0392b,#e74c3c)",
  surprise:    "linear-gradient(135deg,#f39c12,#e67e22)",
  surprised:   "linear-gradient(135deg,#f39c12,#e67e22)",
  pride:       "linear-gradient(135deg,#8e44ad,#3498db)",
  gratitude:   "linear-gradient(135deg,#27ae60,#2ecc71)",
};

export const emoGrad = (emotion = "") =>
  EMO_GRAD[emotion.toLowerCase().split(/[\s/,]/)[0]] ||
  "linear-gradient(135deg,#0a0a0f,#2a2a3f)";

// Tab definitions
export const TABS = [
  { id: "analysis", emoji: "🧠", label: "Analysis"  },
  { id: "captions", emoji: "✍️",  label: "Captions"  },
  { id: "hashtags", emoji: "🔖", label: "Hashtags"  },
  { id: "story",    emoji: "📖", label: "Story"     },
  { id: "palette",  emoji: "🎨", label: "Palette"   },
  { id: "styles",   emoji: "✨", label: "Styles"    },
];
