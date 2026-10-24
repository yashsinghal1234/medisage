/**
 * Image OCR Service — PNG/JPG/JPEG text extraction
 * -------------------------------------------------------------
 * Uses tesseract.js (WASM Tesseract, eng language). The worker is created
 * once and reused; first boot downloads the language model from the
 * tessdata CDN, so an internet connection is needed on first use.
 *
 * Guarantees:
 *  - never throws past this module (getBufferText returns '');
 *  - failed OCR falls back to next source (filename heuristics in dev,
 *    honest empty in production);
 *  - oversized images are skipped (DoS guard) instead of OCR-digitized.
 */

const tesseract = require('tesseract.js');
const config = require('../config/env');

// Photos of documents can be far larger than their text deserves; OCR on
// a 30MP file is minutes of CPU for nothing useful.
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = tesseract
      .createWorker('eng')
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
    return '';
  }
}

module.exports = { getTextWithOcr };
