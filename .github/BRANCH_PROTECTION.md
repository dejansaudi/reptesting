# Branch Protection Rules

Set these up in GitHub → Settings → Branches → Add rule

## `main` (production)

- **Branch name pattern:** `main`
- [x] Require a pull request before merging
- [x] Require status checks to pass (select: `Lint & Types`, `Tests`, `Build`)
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings
- [ ] Require approvals: optional for solo, enable for team

## `staging` (pre-production)

- **Branch name pattern:** `staging`
- [x] Require status checks to pass (select: `Lint & Types`, `Tests`)
- [ ] Require a pull request: optional (allows direct merge from feature branches)

## GitHub Environments

Set up in GitHub → Settings → Environments

### `staging`
- No protection rules needed
- Add secrets: `RAILWAY_TOKEN` or `STAGING_HOST` + `STAGING_SSH_KEY`

### `production`
- [x] Required reviewers: add yourself (acts as a manual deploy gate)
- [x] Wait timer: 0 minutes (or 5 min for safety)
- Add secrets: `RAILWAY_TOKEN` or `PRODUCTION_HOST` + `PRODUCTION_SSH_KEY`
