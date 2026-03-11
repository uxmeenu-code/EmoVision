# ⚡ EmoVision — Emotion-Driven AI Creative Platform

> Upload a photo. Feel the story.

EmoVision reads the **emotional meaning** of your moment and automatically generates emotionally resonant captions, hashtags, story arcs, colour palettes, and AI style directions — powered by Claude's multimodal vision.

![EmoVision](https://img.shields.io/badge/Powered%20by-Claude%20AI-ff4d1c?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## ✨ What it generates

| Output | Description |
|--------|-------------|
| 🧠 **Emotional Fingerprint™** | 27-dimension emotion detection with confidence scores |
| ✍️ **5 Caption Styles** | Poetic · Punchy · Storytelling · Trending · Minimal |
| 🔖 **Smart Hashtags** | 8 trend-matched tags + platform strategy |
| 📖 **Story Arc** | 3-frame visual narrative (Opening → Peak → Resolution) |
| 🎨 **Colour Palette** | 5-colour emotion-mapped palette with hex codes |
| ✨ **Style Directions** | 4 AI generation prompts (SDXL / Midjourney ready) |

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/emovision.git
cd emovision
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Project Structure

```
emovision/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Panels.jsx      # AnalysisPanel, CaptionsPanel, etc.
│   │   └── UI.jsx          # Tag, Bar, CopyBtn, Spinner, ErrorBanner
│   ├── App.jsx             # Main app, routing between phases
│   ├── api.js              # Anthropic API wrapper
│   ├── constants.js        # Design tokens, TABS, emotion gradients
│   ├── imageUtils.js       # Image compression + format normalisation
│   └── main.jsx            # React entry point
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── .gitignore
```

---

## 🖼️ Image Handling

EmoVision automatically handles any image format and size:

- **Auto-compression** — images are resized and re-encoded as JPEG to stay under the Anthropic API's 5 MB limit
- **Progressive fallback** — if canvas resize fails (some sandboxed environments), raw bytes are used
- **Supported formats** — JPG, PNG, WEBP, HEIC, AVIF, BMP, TIFF, GIF

---

## 🌐 Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set `VITE_ANTHROPIC_API_KEY` in your Vercel project's Environment Variables.

### Netlify

```bash
npm run build
netlify deploy --prod --dir dist
```

Set `VITE_ANTHROPIC_API_KEY` in Netlify's Site Settings → Environment Variables.

### GitHub Pages

```bash
npm run build
# Push the dist/ folder to a gh-pages branch
```

---

## 🔐 Production Security Note

This app calls the Anthropic API **directly from the browser**, which means the API key is visible in the client bundle. This is fine for:
- Personal / internal tools
- Demos and prototypes

For a **public production app**, proxy API calls through a backend so the key never reaches the client:

```
Browser → Your Backend (Vercel Edge Function / Express / Cloudflare Worker) → Anthropic API
```

Example Vercel Edge Function:

```js
// api/claude.js
export default async function handler(req) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,  // server-side only
      "anthropic-version": "2023-06-01",
    },
    body: req.body,
  });
  return response;
}
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| AI Model | Claude Sonnet (claude-sonnet-4-20250514) |
| API | Anthropic Messages API |
| Styling | Inline styles (zero CSS dependencies) |
| Fonts | Helvetica Neue / Helvetica / Arial |

---

## 📄 License

MIT — free to use, modify, and deploy.

---

Built with ❤️ and Claude AI
