// Collector handles: the same format rule the API enforces (User::HANDLE_FORMAT).
export const HANDLE_FORMAT = /^[a-z][a-z0-9_]{2,29}$/;

export function normalizeHandle(value) {
  return String(value || '').trim().replace(/^@/, '').toLowerCase();
}

export function isValidHandle(value) {
  return HANDLE_FORMAT.test(normalizeHandle(value));
}

export const HANDLE_RULE = '3–30 characters: lowercase letters, numbers and underscores, starting with a letter.';

// Messages for the API's handle_available `reason`.
export function handleReasonMessage(reason) {
  if (reason === 'taken') return 'That handle is taken.';
  if (reason === 'reserved') return "That one's reserved.";
  if (reason === 'invalid') return HANDLE_RULE;
  return null;
}

// Public page path for a handle.
export function collectorPath(handle) {
  return `/c/${normalizeHandle(handle)}`;
}
