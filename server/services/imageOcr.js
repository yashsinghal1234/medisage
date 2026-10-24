/**
 * Image OCR Service — PNG/JPG/JPEG text extraction
 * -------------------------------------------------------------
 * Uses tesseract.js (WASM Tesseract, eng language). The worker is created
 * once and reused; the language model is cached on first use (gitignored:
 * server/.tessdata) and downloads from the tessdata CDN only when missing.
 *
 * Guarantees:
 *  - never throws past this module (getBufferText returns '');
 *  - failed OCR falls back to next source (filename heuristics in dev,
 *    honest empty in production);
 *  - oversized images are skipped (DoS guard) instead of OCR-digitized.
 */

const tesseract = require('tesseract.js');
const path = require('path');
const config = require('../config/env');

// Photos of documents can be far larger than their text deserves; OCR on
// a 30MP file is minutes of CPU for nothing useful.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** Minimal image sniffing so corrupt/unsupported bytes never reach Tesseract. */
const hasPrintableImageMagic = (buffer) => {
  if (buffer.length < 4) return false;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return isPng || isJpeg;
};

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = tesseract
      .createWorker('eng', undefined, {
        cachePath: path.join(__dirname, '../.tessdata'),
        // Worker-level failures (corrupt image decode, engine hiccups) are
        // intercepted here — the default behavior THROWS from the message
        // handler, which would crash the whole server process on a bad image.
        errorHandler: () => {},
      })
      .catch((err) => {
        workerPromise = null; // one-shot retry allowed on next request
        throw err;
      });
  }
  return workerPromise;
}

/**
 * OCR an image buffer.
 * @param {Buffer} buffer image bytes (PNG/JPG)
 * @returns {Promise<string>} the recognized text ('' when nothing readable)
 */
async function getTextWithOcr(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return '';
  if (buffer.length > MAX_IMAGE_BYTES) {
    console.warn(`[OCR] Image skipped (${(buffer.length / 1024 / 1024).toFixed(1)} MB exceeds the ${MAX_IMAGE_BYTES / 1024 / 1024} MB limit)`);
    return '';
  }
  if (!hasPrintableImageMagic(buffer)) {
    // Not a decodable PNG/JPG — skip OCR instead of crashing the engine
    return '';
  }

  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(buffer);
    return (data && data.text) || '';
  } catch (err) {
    // Worker-level failure (missing language model offline, corrupt image):
    // log, drop the worker cache and return empty — never fail the request.
    if (config.isProd) {
      console.warn('[OCR] recognition failed:', err.message);
    }
    workerPromise = null; // a worker that hit an image error may be poisoned
    return '';
  }
}

module.exports = { getTextWithOcr };
