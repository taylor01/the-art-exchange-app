# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). A `vX.Y.Z` tag deploys that version.

## [Unreleased]

### Added

- **Several copies of one poster.** The poster page lists every copy on your wall (edition,
  condition, for sale and price), each with its own Manage link, and has an **Add another
  copy** button that opens the new copy so you can fill it in. On My wall, **On my wall**
  shows one tile per poster with a ×2 / ×3 sticker and the editions underneath, and opens
  the poster page; **For sale** still shows each listed copy on its own. The count reads
  "8 posters · 12 copies".
- **Series on the poster page.** A poster that's part of a series (Playing Cards, Chess
  Series, the weekend runs…) shows the whole set in show order, with the one you're on
  outlined. Signed-in collectors see which ones are on their wall or hunt list and
  "You have 2 of 5".

## [0.5.1] - 2026-11-23

### Fixed

- Signing in, joining and deleting an account were impossible: the code boxes took 6 digits
  and the API sends 8 (`SignInCode::DIGITS`). The boxes, the checks and the wording now use
  one setting, `CODE_LENGTH` in `src/config/auth.js`, set to 8. The boxes are in two groups
  of four, like the code in the email ("1234 5678"), and pasting the code with its space
  still fills them all.

## [0.5.0] - 2026-11-23

### Added

- **Delete your account** at the bottom of Settings: says what is deleted and what stays
  with other people, emails a fresh code, and deletes only when you enter it and press
  the button (`DELETE /users/account`, API #88). You're signed out afterwards.

### Changed

- **Accounts are on in production.** `deploy.yml` builds with `VITE_ENABLE_ACCOUNTS: 'true'`,
  so sign-in, walls, Messages and Settings are live. Needs API v0.5.0 (#88, #91) deployed first.
- Privacy policy rewritten to match how the service works: email codes instead of
  passwords, what's public and what isn't, messages and reports, AI processing through
  Amazon Bedrock, no tracking cookies or analytics, and what account deletion removes.
  Terms: buying, selling and trading replace the "future e-commerce" section, and the
  rule against commercial use is gone. Both show a fixed "last updated" date instead of
  today's.

## [0.4.0] - 2026-11-23

### Added

- Poster page **Prices**: last sale, 12-month median and range, value against the
  release price, and a bar per confirmed sale (`GET /posters/:id/price_history`), beside
  **For sale now** (`GET /posters/:id/listings`) with a **Message @seller** button on each
  copy. Needs API #80 and #82.
- **Messages** (`/messages`, `/messages/:id`, with an unread count in the header): one
  conversation per buyer per copy. Talk it over, the seller presses **Mark sold** with the
  price, and the buyer confirms it in the thread; it then locks and stays as the record.
  Either person can close a conversation or report it. Nobody's email is shown to the
  other person. Threads refresh every 10 seconds while on screen and mark themselves read
  up to the newest message shown. Needs API #91.
- My Wall **Buying & selling** tab: sales waiting on you or on the other collector, each
  linking to its conversation, and completed trades.
- "How you hand it over" (ships / meets at shows / either) on a copy listed for sale.

## [0.3.0] - 2026-11-23

### Added

- Settings page (`/settings`, from the initials in the header): name, city, handle and
  whether the Hunting and For sale lists are public. Shows exactly what visitors will see
  before a list goes public, and warns that shared links stop working when one goes
  private. Needs API #79.
- Handle field with a live check while typing (format checked locally first, then
  `GET /users/handle_available` after 400 ms), the reason a handle won't work, and
  tappable suggestions. Disabled with the next allowed date during the 30-day wait.
- The welcome step shows the generated handle (keep it or change it) and the two list
  toggles, both private by default.
- Public collector page (`/c/:handle`) showing only the lists that collector made public.
  An old handle still opens the page and the URL switches to the current one.
- On a copy listed for sale, a note when the For sale list is private: buyers won't see it
  until the list is public.

### Changed

- The poster page asks the API only for the collector's copies of that poster
  (`GET /user_posters?poster_id=`, API #78) instead of their whole wall.

## [0.2.0] - 2026-11-23

### Changed

- New "Print Shop" look from the Art Exchange design system: cream paper, black 3px
  outlines, hard offset shadows, one pink accent, Anton / Space Grotesk / Space Mono.
  Styles are plain CSS in `src/styles/` (tokens, components, layout); Bootstrap is gone.
- The logo's sign is now the accent pink with "ART" in dark type.
- Home, archive (search plus one filter per facet, all in the URL, paged) and poster pages
  rebuilt. The poster page adds print details, other posters from the same show, the
  setlist, recordings, the venue and the artist, with an empty price-history section until
  trades exist.
- Sign-in and joining use emailed 6-digit codes (`POST /auth/code`, `POST /auth/verify`)
  instead of passwords; new accounts get a short name and city step.
- Collections are now My Wall (`/wall`): posters on the wall, listed for sale and hunted,
  shows attended, and a page per copy for edition, condition, price paid, notes and
  listing it for sale. Adding to the wall sends the body the API expects
  (`{ user_poster: … }`).

### Removed

- Bootstrap and its Popper dependency; the old Login and Signup pages (`/login`, `/signup`
  and `/collection` redirect to the new routes).

## [0.1.0] - 2026-11-22

The first release on AWS: public browsing of the poster catalog at https://theartexch.com.

### Added

- Static hosting on AWS (`infra/web`): a private S3 bucket behind CloudFront and the shared
  WAF, `theartexch.com` with `www` redirecting to it, and access logs to the platform's
  edge-logs bucket.
- A tag-gated deploy: on `v*` tags it checks the commit is on `main`, CI passed and the
  changelog has the version, then builds, uploads to S3 and clears the CloudFront cache.
- `VITE_ENABLE_ACCOUNTS`: sign-in, sign-up and collection features are hidden until the API
  supports sign-in for imported users. Tests cover both modes.

### Changed

- The API URL is fixed at build time (`VITE_API_URL`) instead of a runtime `config.js`.
- CI fails on lint errors and on high-severity dependency advisories.

### Removed

- The Docker image, nginx config, compose files and GHCR workflow.

### Fixed

- Six lint errors, all in `main` before this release.

### Security

- `npm audit fix` clears all 24 known advisories (1 critical, 17 high).
