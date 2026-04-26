# Annie 网站环境变量配置说明

这份文档说明项目里几类环境变量分别给谁用，以及在 `Docker 开发`、`本地直跑`、`生产部署` 三种场景下应该怎么配。

## 先看结论

本项目里最容易混淆的是两件事：

- 根目录 `.env` 主要给 `docker compose` 使用
- 后端进程真正监听的端口变量是 `PORT`，不是 `BACKEND_PORT`

当前代码和 Docker 配置的实际行为如下：

- Nest.js 后端读取 `PORT`，见 [backend/src/main.ts](/Users/yanlin/projects/annie-website/backend/src/main.ts:26)
- 配置模块读取 `PORT`、`DATABASE_URL`、`REDIS_URL`、`MEILISEARCH_URL` 等变量，见 [backend/src/config/configuration.ts](/Users/yanlin/projects/annie-website/backend/src/config/configuration.ts:1)
- Docker Compose 中，backend 容器内部固定监听 `3000`，宿主机通过 `BACKEND_PORT` 暴露出去，见 [docker-compose.yml](/Users/yanlin/projects/annie-website/docker-compose.yml:92)

所以可以这样理解：

- `PORT`
  后端进程实际监听端口
- `BACKEND_PORT`
  Docker 场景下宿主机访问后端的端口映射

## 环境变量分组

### 1. 部署脚本变量

这些变量用于 `scripts/setup-server.sh` 和 `scripts/deploy-app.sh`。

```bash
SSH_HOST=your-server-ip-or-domain
SSH_USER=ubuntu
SSH_KEY=/path/to/your/private/key
DOMAIN=your-domain.com

POSTGRES_PASSWORD=your-secure-db-password-here
JWT_SECRET=your-very-secure-jwt-secret-here
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here

DOCKER_REGISTRY_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/path/to/your/certificate.pem
SSL_KEY_PATH=/path/to/your/private.key
```

说明：

- `SSH_*` 用于连接服务器
- 推荐使用具备 `sudo` 权限的非 `root` 用户作为 `SSH_USER`
- `POSTGRES_PASSWORD`、`JWT_SECRET`、`MEILISEARCH_MASTER_KEY` 会被部署脚本写入服务器端环境文件
- `DOCKER_REGISTRY_MIRROR` 是 `setup-server.sh` 必填项
- `SSL_CERT_PATH`、`SSL_KEY_PATH` 是你本地机器上的证书路径，脚本会上传到服务器

### 2. 应用运行时变量

这些变量供前后端容器或本地运行的服务使用。

```bash
NODE_ENV=production
PORT=3001
BACKEND_PORT=3001

POSTGRES_USER=annie
POSTGRES_PASSWORD=your-secure-db-password-here
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public

REDIS_URL=redis://redis:6379

MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
MEILI_MASTER_KEY=your-secure-meilisearch-key-here

JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://your-domain.com

ANNIE_API_URL=https://annie-api.your-domain.com
ANNIE_API_KEY=your-annie-api-key

OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789/ws
OPENCLAW_GATEWAY_TOKEN=your-openclaw-gateway-token
OPENCLAW_SUPERPOWER_AGENT=superpower
OPENCLAW_SUPERPOWER_SESSION_LABEL=annie-chat-runtime
OPENCLAW_SUPERPOWER_STATE_FILE=.runtime/superpower-chat-session.json
OPENCLAW_SUPERPOWER_FIRST_CHUNK_TIMEOUT_MS=15000
OPENCLAW_SUPERPOWER_IDLE_TIMEOUT_MS=45000
```

说明：

- `MEILI_MASTER_KEY` 主要给 MeiliSearch 容器使用
- `MEILISEARCH_MASTER_KEY` 给后端应用使用
- 这两个值在本项目里应保持一致

### 2.1 OpenClaw Superpower Chat Bridge

以下环境变量用于配置后端 chat 模块与 OpenClaw Gateway 之间的 superpower 专用 session 桥接服务。

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `OPENCLAW_GATEWAY_URL` | `ws://127.0.0.1:18789/ws` | OpenClaw Gateway WebSocket 地址 |
| `OPENCLAW_GATEWAY_TOKEN` | （无） | Gateway 鉴权 token，必填 |
| `OPENCLAW_SUPERPOWER_AGENT` | `superpower` | 专用 session 绑定的目标 agent 名称 |
| `OPENCLAW_SUPERPOWER_SESSION_LABEL` | `annie-chat-runtime` | 专用 session 的标签，bridge 据此查找或创建 session |
| `OPENCLAW_SUPERPOWER_STATE_FILE` | `.runtime/superpower-chat-session.json` | 专用 session 状态文件路径（后端本地文件） |
| `OPENCLAW_SUPERPOWER_FIRST_CHUNK_TIMEOUT_MS` | `15000` | 等待上游首块响应的超时（毫秒） |
| `OPENCLAW_SUPERPOWER_IDLE_TIMEOUT_MS` | `45000` | 空闲超时（毫秒），超时后关闭 session |

本地开发场景下，Gateway 通常在本机运行，使用默认值即可。生产环境请根据实际 Gateway 部署地址调整 `OPENCLAW_GATEWAY_URL` 和 `OPENCLAW_GATEWAY_TOKEN`。

## 三种常见场景

### 1. 本地直跑

适合你直接在本机运行后端和前端，并且数据库、Redis、MeiliSearch 也都运行在本机。

建议使用：

```bash
cp .env.local.example .env.local
```

示例：

```bash
NODE_ENV=development
PORT=3001
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000

POSTGRES_USER=annie
POSTGRES_PASSWORD=your-secure-db-password-here
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:your-password@localhost:5432/annie_db?schema=public

REDIS_URL=redis://localhost:6379

MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
MEILI_MASTER_KEY=your-secure-meilisearch-key-here

JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

ANNIE_API_URL=http://localhost:8000
ANNIE_API_KEY=your-annie-api-key
```

这个场景下要特别注意：

- `DATABASE_URL` 必须使用 `localhost`
- `REDIS_URL` 必须使用 `localhost`
- `MEILISEARCH_URL` 必须使用 `localhost`
- `PORT` 才决定后端监听端口

### 2. 本地 Docker Compose 开发

适合你希望一键拉起 Postgres、Redis、MeiliSearch、backend、frontend 整套服务。

建议使用：

```bash
cp .env.example .env
```

或者：

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d
```

示例：

```bash
NODE_ENV=development
BACKEND_PORT=3001
CORS_ORIGIN=http://localhost:3000

POSTGRES_USER=annie
POSTGRES_PASSWORD=your-secure-db-password-here
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public

REDIS_URL=redis://redis:6379

MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
MEILI_MASTER_KEY=your-secure-meilisearch-key-here

JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

ANNIE_API_URL=http://localhost:8000
ANNIE_API_KEY=your-annie-api-key
```

这个场景下要特别注意：

- `DATABASE_URL` 必须使用服务名 `postgres`
- `REDIS_URL` 必须使用服务名 `redis`
- `MEILISEARCH_URL` 必须使用服务名 `meilisearch`
- `BACKEND_PORT` 控制的是宿主机访问 `backend` 的端口
- backend 容器内部监听端口仍然是 `3000`

### 3. 生产部署

生产环境不要直接复用本地开发配置，推荐使用：

- `deploy.env`
  给部署脚本使用
- 服务器端 `.env`
  给 Docker Compose 使用
- 服务器端 `backend/.env`
  给后端使用

推荐做法：

```bash
./scripts/setup-env.sh
```

这个脚本会自动生成：

- `.env`
- `backend/.env`
- `deploy.env`
- `secrets.env`

部署时使用：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

## 文件对应关系

### `.env.example`

默认的 Docker Compose 开发示例。适合作为根目录 `.env` 的模板。

### `.env.docker.example`

显式区分 Docker 开发环境时使用的示例文件。

### `.env.local.example`

本地直跑开发的示例文件。

### `.env`

根目录运行时环境文件。默认由 Docker Compose 读取。

### `backend/.env`

后端运行时环境文件。适合后端单独运行或部署时使用。

### `deploy.env`

部署脚本使用的环境变量文件。

### `secrets.env`

本地生成的敏感信息备份文件，不应提交到版本控制。

## 后端如何读取环境变量

当前后端支持按下面顺序读取环境变量文件：

1. `backend/.env.local`
2. `backend/.env`
3. 根目录 `.env.local`
4. 根目录 `.env`

这样做的目的是同时兼容：

- 在 `backend/` 目录下直接运行 Nest.js
- 在项目根目录共享环境变量

## 安全建议

- 不要把 `.env`、`backend/.env`、`deploy.env`、`secrets.env`、`*.key`、`*.pem` 提交到 Git
- 生产环境不要使用示例里的占位值
- `JWT_SECRET`、`POSTGRES_PASSWORD`、`MEILISEARCH_MASTER_KEY` 应使用随机强密钥
- 建议定期轮换密钥和密码

常见生成方式：

```bash
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32)
```

## 证书与 SSH 准备

### SSL 证书

如果使用 Let's Encrypt，常见路径通常是：

```bash
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### SSH 密钥

推荐使用 Ed25519：

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/annie-deploy -N ""
chmod 600 ~/.ssh/annie-deploy
chmod 644 ~/.ssh/annie-deploy.pub
```

上传公钥：

```bash
ssh-copy-id -i ~/.ssh/annie-deploy.pub user@your-server-ip
```

## 常见错误

### 错误 1：本地直跑却把数据库地址写成 `postgres`

这是 Docker Compose 场景的写法。本地直跑时应改成 `localhost`。

### 错误 2：以为 `BACKEND_PORT` 会改变 Nest.js 实际监听端口

不会。后端进程实际读取的是 `PORT`。

### 错误 3：Docker Compose 场景里把 Redis 或 MeiliSearch 写成 `localhost`

容器内访问其他容器应使用服务名，不应使用 `localhost`。

### 错误 4：生产环境继续使用示例占位值

这些占位值只用于说明结构，不能直接用于生产。

## 相关文档

- [README.md](/Users/yanlin/projects/annie-website/README.md)
- [DEPLOYMENT-QUICKSTART.md](/Users/yanlin/projects/annie-website/DEPLOYMENT-QUICKSTART.md)
- [docs/deployment.md](/Users/yanlin/projects/annie-website/docs/deployment.md)
