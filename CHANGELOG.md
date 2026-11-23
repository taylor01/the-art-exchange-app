# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/). A `vX.Y.Z` tag deploys that version.

## [Unreleased]

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
