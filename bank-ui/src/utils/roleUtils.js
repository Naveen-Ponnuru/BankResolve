// Centralized role normalization helper
// Rules:
// - Remove leading "ROLE_" prefix (case-insensitive)
// - Trim whitespace
// - Uppercase result
export const normalizeRole = (roleString) => {
  if (!roleString) return "";
  const raw = roleString.toString();
  return raw.replace(/^ROLE_/i, "").trim().toUpperCase();
};

