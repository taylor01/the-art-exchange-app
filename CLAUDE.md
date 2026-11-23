# The Art Exchange Web App

React 19 + Vite single-page app for browsing the concert poster catalog. It calls the API at
`https://api.theartexch.com/api/v1` (taylor01/the-art-exchange-api) and is served from S3 through
CloudFront at **https://theartexch.com**.

## Standards

A personal project that follows Hendrick's engineering standards (the ENG ADRs) by choice. It
runs in the personal AWS account `taylor-art-exchange` (225635745787), never a Hendrick account.
Terraform Cloud org is `taylor01`, never `hendrick`.

- Default branch `main`; work on feature branches and merge through PRs.
- Merging does not deploy; a `vX.Y.Z` tag does. Every release has a dated `CHANGELOG.md` entry.
- Before opening a PR: `npm run lint`, `npm audit --audit-level=high`, `npm run test:run`, `npm run build`.
- Accounts (sign in, sign up, collections) are behind `VITE_ENABLE_ACCOUNTS`, off in production.
  Tests that cover them mock `src/config/features` to turn them on; `PublicMode.test.jsx`
  covers the default.

## Infrastructure

`infra/web` (Terraform Cloud project `art-exchange`, workspace `art-exchange-web-production`,
CLI-driven with local execution, Terraform 1.15.7). It reads the shared platform (zone, data
key, edge web ACL, edge-logs bucket) from the API repo's `infra/platform` and the web deploy role
from `taylor01/aws-org`, and sets the GitHub `production` environment and deploy variables itself.

```sh
aws sso login --sso-session taylor
export AWS_PROFILE=taylor-art-exchange GITHUB_TOKEN=$(gh auth token)
cd infra/web && terraform init && terraform plan -out=tfplan   # read it
terraform apply tfplan
```

## Deviations from the standard

| Standard | What this repo does instead | Why |
|---|---|---|
| ENG-0019: VCS-connected workspaces with `trigger_patterns` | CLI-driven workspace, local execution | Same as the API and aws-org: one person, few applies. |
| ENG-0014: versioning on buckets | No versioning on the site bucket | Every file is rebuilt by each deploy; nothing in it is irreplaceable. |
