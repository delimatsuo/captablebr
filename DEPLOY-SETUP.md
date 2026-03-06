# Deployment Setup Log

**Generated**: 2026-03-05
**Generator**: /deploy-setup v1
**Platform**: Cloud Run
**Config schema**: v1

## What Was Configured

- [x] Deploy config: `.claude/deploy-config.yaml`
- [x] GitHub Actions: `.github/workflows/deploy.yml` (starter)
- [x] GitHub Actions: `.github/workflows/rollback.yml` (starter)
- [skip] Dockerfile: already exists
- [x] Docker ignore: `.dockerignore`
- [x] Staging branch created (local)

## Detected Configuration

| Item | Value | Source |
|------|-------|--------|
| Stack | Next.js 16 + TypeScript | package.json |
| Platform | Cloud Run | Dockerfile (port 8080, standalone) |
| GCP Project | paynequity (#777685600587) | User input |
| Git Provider | GitHub | User: delimatsuo/captablebr |
| Branch Strategy | staging -> main | Created staging branch |
| CI/CD | GitHub Actions | Generated starters |

## Manual Steps Required

- [ ] Create GitHub repo: `gh repo create delimatsuo/captablebr --private --source=. --push`
- [ ] Push staging branch: `git push -u origin staging`
- [ ] Review and customize TODO comments in `.github/workflows/deploy.yml`
- [ ] Set up Workload Identity Federation in GCP Console for GitHub Actions
- [ ] Create a service account `github-deployer@paynequity.iam.gserviceaccount.com`
- [ ] Grant `roles/run.admin` and `roles/iam.serviceAccountUser` to the service account
- [ ] Set up Cloud SQL (Postgres) for staging and production
- [ ] Configure environment variables in Cloud Run (Firebase keys, DB URL, etc.)
- [ ] Set up DNS for staging URL when ready
- [ ] Set up DNS for production URL (captablebr.com) when ready
- [ ] Enable branch protection on `main` and `staging`
- [ ] Verify health check endpoint at `/api/health` returns 200
- [ ] Run `/deploy-staging` to test the pipeline end-to-end
