/**
 * imageUtils.js
 * Converts any uploaded image to a base64 JPEG that fits within
 * Anthropic's 5 MB (5 242 880 byte) vision API hard limit.
 *
 * Strategy:
 *  1. Read file bytes with FileReader (works in every browser/iframe sandbox)
 *  2. Draw onto a canvas and re-encode as JPEG
 *  3. If the result is still too large, progressively halve the dimensions
 *     and/or reduce quality until it fits
 *  4. If canvas/Image fails (e.g. HEIC on some browsers) fall back to raw
 *     bytes — but only if they are already within the size limit
 */

const MAX_BYTES   = 4 * 1024 * 1024; // 4 MB — stay under the 5 MB hard limit
const MAX_DIM     = 1600;             // max pixel dimension on the long edge
const INIT_QUALITY = 0.88;

const SUPPORTED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const EXT_MIME_MAP   = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif",  webp: "image/webp", heic: "image/jpeg",
  heif: "image/jpeg", avif: "image/jpeg", bmp: "image/jpeg",
  tiff: "image/jpeg", tif: "image/jpeg",  jfif: "image/jpeg",
};

/** Return a safe MIME type for the Anthropic API */
function safeMime(file) {
  if (SUPPORTED_MIME.includes(file.type)) return file.type;
  const ext = (file.name || "").split(".").pop().toLowerCase();
  return EXT_MIME_MAP[ext] || "image/jpeg";
}

/** base64 string → byte length */
function b64Bytes(b64) {
  return Math.ceil((b64.length * 3) / 4);
}

/** Read a File → raw base64 via FileReader */
function readRawBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed. Please try another image."));
    reader.onload  = (e) => {
      const b64 = e.target.result.split(",")[1];
      if (!b64) reject(new Error("Empty file."));
      else resolve(b64);
    };
    reader.readAsDataURL(file);
  });
}

/** Load an Image element from a blob URL (may fail in some sandboxes) */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img   = new Image();
    const timer = setTimeout(() => reject(new Error("Image load timeout")), 8000);
    img.onload  = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error("Image element failed")); };
    img.src     = url;
  });
}

/** Draw img onto a canvas at (w × h) and return base64 JPEG at given quality */
function canvasToJpeg(img, w, h, quality) {
  const canvas = document.createElement("canvas");
  canvas.width  = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality).split(",")[1];
}

/**
 * Main export.
 * Returns { b64: string, mime: string } always — never throws for format
 * reasons; only throws if the file truly cannot be made small enough.
 */
export async function prepareImage(file) {
  if (!file) throw new Error("No file provided.");

  const mime = safeMime(file);

  // ── Fast path: try canvas resize ─────────────────────────────────────────
  let url;
  try {
    url = URL.createObjectURL(file);
    const img = await loadImage(url);

    let w = img.naturalWidth  || 800;
    let h = img.naturalHeight || 600;

    // Shrink to MAX_DIM on the long edge
    if (w > MAX_DIM || h > MAX_DIM) {
      if (w >= h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
      else        { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
    }

    let quality = INIT_QUALITY;
    let b64     = canvasToJpeg(img, w, h, quality);

    // Progressive compression loop — halve quality or dimensions until < MAX_BYTES
    let attempts = 0;
    while (b64Bytes(b64) > MAX_BYTES && attempts < 10) {
      attempts++;
      if (quality > 0.4) {
        quality = Math.max(0.3, quality - 0.12);
        b64 = canvasToJpeg(img, w, h, quality);
      } else {
        // Quality floor reached — reduce dimensions by 25 %
        w = Math.round(w * 0.75);
        h = Math.round(h * 0.75);
        quality = INIT_QUALITY; // reset quality after resize
        b64 = canvasToJpeg(img, w, h, quality);
      }
    }

    try { URL.revokeObjectURL(url); } catch (_) {}

    if (b64Bytes(b64) > MAX_BYTES) {
      throw new Error("Image is too large to compress within the 4 MB limit. Please use a smaller image.");
    }

    return { b64, mime: "image/jpeg" };

  } catch (canvasErr) {
    // ── Fallback: use raw bytes ─────────────────────────────────────────────
    try { if (url) URL.revokeObjectURL(url); } catch (_) {}

    // Only proceed if the raw bytes themselves fit
    const rawB64 = await readRawBase64(file);
    if (b64Bytes(rawB64) > MAX_BYTES) {
      throw new Error(
        "Image exceeds the 5 MB API limit and could not be resized automatically. " +
        "Please reduce the image size or use a compressed JPG/PNG."
      );
    }
    return { b64: rawB64, mime };
  }
}
