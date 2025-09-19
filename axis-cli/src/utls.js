/**
 * Safe JSON parse (with fallback).
 */
function safeParseJSON(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Deep clone via JSON.
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj ?? null));
}

/**
 * Pretty print JSON or string.
 */
function prettyPrint(obj, indent = 2) {
  if (typeof obj === 'string') return obj;
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}

/**
 * Safe string conversion.
 */
function safe(v) {
  if (v === undefined || v === null) return '';
  return String(v);
}

module.exports = {
  safeParseJSON,
  deepClone,
  prettyPrint,
  safe
};
