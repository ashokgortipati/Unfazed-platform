/**
 * Validation utility helpers
 */

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidTimeFormat = (timeStr) => {
  // Matches HH:mm (24 hour format)
  const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return re.test(timeStr);
};

export const isValidDateFormat = (dateStr) => {
  // Matches YYYY-MM-DD
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};
