/**
 * api.js
 * Thin wrapper around the Anthropic /v1/messages endpoint.
 * The API key is read from the VITE_ANTHROPIC_API_KEY env variable.
 *
 * IMPORTANT — SECURITY NOTE:
 *   Calling the Anthropic API directly from the browser exposes your API key
 *   in the client bundle. This is acceptable for personal / demo projects.
 *   For production, proxy requests through a backend (e.g. Vercel Edge Function,
 *   Express server, or Cloudflare Worker) so the key never reaches the browser.
 *   See README.md → "Production Deployment" for guidance.
 */

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL    = "claude-sonnet-4-20250514";

export async function callClaude(system, userContent) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error(
      "Missing API key. Copy .env.example → .env and add your VITE_ANTHROPIC_API_KEY."
    );
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type":         "application/json",
      "x-api-key":            apiKey,
      "anthropic-version":    "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = (data.content || []).map((b) => b.text || "").join("");

  // Extract the first complete JSON object from the response
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned no JSON.");

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (_) {
    throw new Error("Failed to parse model response. Please retry.");
  }
}
