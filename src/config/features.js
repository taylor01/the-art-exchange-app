// Build-time feature switches (Vite env, fixed when the site is built).

// Accounts (sign in, sign up, collections) stay off until the API supports
// sign-in for imported users (emailed one-time codes). The pages and store
// remain in the code; this only hides the routes, links and buttons.
export const accountsEnabled = import.meta.env.VITE_ENABLE_ACCOUNTS === 'true';
