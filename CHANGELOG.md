# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). A `vX.Y.Z` tag deploys that version.

## [Unreleased]

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
