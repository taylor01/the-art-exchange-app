# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). A `vX.Y.Z` tag deploys that version.

## [Unreleased]

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
