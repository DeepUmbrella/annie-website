# Annie Infra Split Plan

This document defines the proposed `annie-infra` repository after splitting the current mono-repo into:

- `annie-frontend`
- `annie-backend`
- `annie-infra`

## Goals

- Keep deployment, server setup, Nginx, smoke checks, and environment templates outside app code.
- Let frontend and backend repositories build and deploy independently.
- Preserve the current production shape:
  - Frontend: `https://www.linany.com`
  - API: `https://api.linany.com/api/v1`
  - Main-domain legacy API redirect: `https://www.linany.com/api/*` -> `https://api.linany.com/api/*`

## Proposed `annie-infra` Contents

```text
annie-infra/
├── README.md
├── DEPLOYMENT-QUICKSTART.md
├── docker-compose.yml
├── docker-compose.backend-only.yml
├── .env.example
├── .env.docker.example
├── .env.local.example
├── docs/
│   ├── deployment.md
│   ├── deployment-optimizations.md
│   └── environment-variables-setup.md
└── scripts/
    ├── deploy-app.sh
    ├── setup-env.sh
    ├── setup-nginx.sh
    ├── setup-server.sh
    └── smoke-production.sh
```

## Keep Out Of `annie-infra`

Do not commit runtime secrets or host-specific generated files:

```text
.env
.env.local
.env.docker
backend/.env
deploy.env
secrets/
*.pem
*.key
*.crt
```

The current local `install-cn.ps1` is intentionally not part of this split unless it becomes a managed release/download artifact.

## App Repository Ownership

### `annie-frontend`

Generated from:

```bash
git subtree split --prefix=frontend -b split/frontend
```

Owned files include:

```text
Dockerfile
nginx.conf
package.json
package-lock.json
src/
public/
tests/
vite.config.ts
playwright.config.ts
```

Required production build variable:

```text
VITE_API_URL=https://api.linany.com
```

### `annie-backend`

Generated from:

```bash
git subtree split --prefix=backend -b split/backend
```

Owned files include:

```text
Dockerfile
package.json
package-lock.json
src/
test/
prisma/
prisma.config.ts
```

Fresh builds must generate Prisma Client before TypeScript compilation. This is now encoded in:

```bash
npm run build
```

Required production runtime variables:

```text
DATABASE_URL
REDIS_URL
MEILISEARCH_URL
MEILISEARCH_MASTER_KEY
JWT_SECRET
CORS_ORIGIN=https://www.linany.com
```

## Infra Deployment Variables

`deploy.env` should contain at least:

```bash
SSH_HOST=8.156.86.210
SSH_USER=root
SSH_KEY=~/.ssh/aliyun.pem

DOMAIN=www.linany.com
API_DOMAIN=api.linany.com

POSTGRES_PASSWORD=...
JWT_SECRET=...
MEILISEARCH_MASTER_KEY=...

SSL_CERT_PATH=/path/to/www.linany.com.crt
SSL_KEY_PATH=/path/to/www.linany.com.key
API_SSL_CERT_PATH=/path/to/api.linany.com.pem
API_SSL_KEY_PATH=/path/to/api.linany.com.key
```

If main-site certificates already exist on the server, `setup-nginx.sh` can be run with:

```bash
UPLOAD_MAIN_SSL=false
```

## Current Split Branches

Local preview branches:

```text
split/frontend
split/backend
```

Validation commands:

```bash
# frontend split
cd /private/tmp/annie-frontend-split
npm ci
npm run build

# backend split
cd /private/tmp/annie-backend-split
npm ci
npm run build
```

## Migration Steps

1. Push the current mono-repo commits.
2. Create empty GitHub repositories:
   - `annie-frontend`
   - `annie-backend`
   - `annie-infra`
3. Push split branches:

```bash
git push <frontend-remote> split/frontend:main
git push <backend-remote> split/backend:main
```

4. Create `annie-infra` from the proposed contents above.
5. Update infra deployment scripts to pull/build from the new frontend/backend repositories or, preferably, deploy tagged Docker images.
6. Run:

```bash
DOMAIN=www.linany.com API_DOMAIN=api.linany.com ./scripts/smoke-production.sh
```

## Open Decisions

- Whether `annie-infra` should build from Git source or consume Docker images pushed by frontend/backend CI.
- Whether frontend should move to CDN/static hosting later while keeping Nginx as the API and redirect layer.
- Whether to keep `docker-compose.backend-only.yml` long term or replace it with service-specific development compose files.
