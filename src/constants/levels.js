// ── Shared MLM Level Constants ────────────────────────────
// Single source of truth — TeamScreen, BusinessPayoutScreen,
// CommissionScreen etc. all import from here.

export const LEVEL_LABELS = {
  1: 'B', 2: 'C', 3: 'D', 4: 'E',
  5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J', 10: 'K',
};

export const LEVEL_COLORS = {
  1: '#1A73E8',  // B — blue
  2: '#7C3AED',  // C — purple
  3: '#059669',  // D — green
  4: '#D97706',  // E — amber
  5: '#DC2626',  // F — red
  6: '#0891B2',  // G — cyan
  7: '#7C3AED',  // H — purple
  8: '#059669',  // I — green
  9: '#D97706',  // J — amber
  10: '#6B7280', // K — gray
};

// Upline level label → color (used in CommissionScreen)
export const UPLINE_LEVEL_COLORS = {
  '1st': '#1A73E8', '2nd': '#7C3AED', '3rd': '#059669',
  '4th': '#D97706', '5th': '#DC2626', '6th': '#0891B2',
  '7th': '#7C3AED', '8th': '#059669', '9th': '#D97706', '10th': '#DC2626',
};
