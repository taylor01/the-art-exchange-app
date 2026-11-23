// Build-time feature switches (Vite env, fixed when the site is built).

// Accounts (sign in, joining, My Wall). The API now signs people in with
// emailed one-time codes; turn this on at build time once it's ready for
// real users. Off hides the routes, links and buttons; the code stays.
export const accountsEnabled = import.meta.env.VITE_ENABLE_ACCOUNTS === 'true';
