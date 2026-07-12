/**
 * Format an ISO timestamp (e.g. "2026-07-12T13:35:00.000Z") into a short
 * local display time like "1:35 PM". Returns '' for missing/invalid input.
 */
export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
