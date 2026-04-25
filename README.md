# Annie Website

Annie AI 助手介绍网站，采用前后端分离架构。

## 技术栈

### 前端
- **框架:** React 19
- **构建工具:** Vite
- **UI 库:** Ant Design
- **状态管理:** Redux Toolkit
- **路由:** React Router
- **样式:** Tailwind CSS

### 后端
- **框架:** Nest.js + TypeScript
- **数据库:** PostgreSQL 15
- **ORM:** Prisma
- **缓存:** Redis 7
- **搜索引擎:** MeiliSearch v1.3
- **认证:** JWT
- **验证:** class-validator

### 部署
- **容器编排:** Docker Compose
- **反向代理:** 宿主机 Nginx 负责 HTTPS / 域名入口
- **前端静态服务:** frontend 容器内 Nginx 负责托管构建产物
- **部署方式:** `setup-server.sh` + `setup-nginx.sh` + `deploy-app.sh`

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd annie-website
```

### 2. 选择一种启动方式

#### Docker 开发

适合第一次上手、希望一键拉起完整依赖的场景。

```bash
cp .env.example .env
docker compose up -d
```

启动后默认访问：

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- MeiliSearch: http://localhost:7700

常用命令：

```bash
docker compose logs -f
docker compose down
```

#### 本地开发

适合单独调试前后端代码。

```bash
cp .env.local.example .env.local
```

后端：

```bash
cd backend
npm install
npm run start:dev
```

前端：

```bash
cd frontend
npm install
npm run dev
```

说明：

- 后端会优先读取 `backend/.env.local`、`backend/.env`，其次读取根目录 `.env.local`、`.env`。
- 推荐把本地开发配置维护在项目根目录 `.env.local` 或 `.env`。
- 当前前端开发服务器默认运行在 `http://127.0.0.1:3000`。
- 当前后端默认运行在 `http://127.0.0.1:3001`。
- 本地开发既可以连接本机上的 PostgreSQL / Redis / MeiliSearch，也可以连接另一台机器上的同类服务，只要环境变量配置正确。

## 三种常见工作方式

### Docker 开发

使用根目录 `.env` 或 `.env.docker`，容器之间通过服务名通信：

- `DATABASE_URL` 使用 `postgres`
- `REDIS_URL` 使用 `redis`
- `MEILISEARCH_URL` 使用 `meilisearch`

推荐做法：

```bash
cp .env.example .env
docker compose up -d
```

如果你想显式区分 Docker 环境文件：

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d
```

### 本地开发

使用 `.env.local` 或根目录 `.env`：

- 前端开发服务器：`127.0.0.1:3000`
- 后端 API：`127.0.0.1:3001`
- `DATABASE_URL` / `REDIS_URL` / `MEILISEARCH_URL` 可以指向本机，也可以指向局域网或另一台开发机
- 后端监听端口使用 `PORT`

推荐做法：

```bash
cp .env.local.example .env.local
```

### 部署
生产环境使用部署脚本和 `deploy.env`，不要直接复用本地开发环境文件。

首次部署通常分三步：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/setup-nginx.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

更完整的部署说明见：

- [DEPLOYMENT-QUICKSTART.md](/Users/yanlin/projects/annie-website/DEPLOYMENT-QUICKSTART.md)
- [docs/deployment.md](/Users/yanlin/projects/annie-website/docs/deployment.md)

### GitHub Actions 自动部署

仓库已经包含 [`.github/workflows/deploy.yml`](/Users/yanlin/projects/annie-website/.github/workflows/deploy.yml)，当代码推送到 `main` 分支时会自动触发部署，也支持手动 `workflow_dispatch`。

在 GitHub 仓库的 `Settings > Secrets and variables > Actions` 中至少配置这些 Secrets：

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `DOMAIN`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `MEILISEARCH_MASTER_KEY`

说明：

- 这套自动部署默认调用 `scripts/deploy-app.sh`
- 服务器首次初始化仍然需要你手动运行一次 `scripts/setup-server.sh` 和 `scripts/setup-nginx.sh`
- 如果仓库是私有仓库，服务器端还需要能访问 GitHub 仓库，否则 `git clone` / `git pull` 会失败

## 环境变量

常用文件如下：

- `.env.example`: Docker Compose 默认示例
- `.env.docker.example`: Docker Compose 专用示例
- `.env.local.example`: 本地直跑专用示例
- `deploy.env`: 生产部署脚本使用的环境变量文件

详细说明见 [docs/environment-variables-setup.md](/Users/yanlin/projects/annie-website/docs/environment-variables-setup.md)。

## 常用命令

### 后端

```bash
cd backend
npm install
npm run start:dev
npm run build
npm run start
npm run start:prod
npm run test
npm run test:e2e
```

### 前端

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

## Playwright E2E

前端已经接入本地 Playwright Runner，推荐用它做本地联调，而不是依赖浏览器工具直接访问 localhost。

### 安装

```bash
cd frontend
npm install
npx playwright install chromium
```

### 运行

```bash
cd frontend
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

### 当前已覆盖的联调场景

- 首页打开与基础导航
- 注册 / 登录 / 恢复登录态
- 联系页反馈提交
- Docs 搜索
- Blog 列表 / 详情
- Chat 创建会话 / 发送消息 / 回车发送
- Profile 页面加载与保存资料

## 当前本地联调状态

目前本地联调已经验证通过的链路包括：

- 前端 `127.0.0.1:3000`
- 后端 `127.0.0.1:3001`
- 后端 API 使用统一前缀 `/api/v1`
- 认证、Docs、Blog、Chat、Feedback、Profile 基础链路可用
- 前端与远程 PostgreSQL / Redis / MeiliSearch 也可通过环境变量接入

## 项目结构

```text
annie-website/
├── frontend/               # React 前端应用
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 可复用组件
│   │   ├── slices/         # Redux slices
│   │   └── assets/         # 静态资源
│   └── package.json
├── backend/                # Nest.js 后端 API
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   ├── common/         # 公共模块
│   │   ├── config/         # 配置
│   │   └── main.ts         # 入口文件
│   ├── prisma/             # Prisma 配置
│   └── package.json
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker 服务配置
└── README.md               # 项目说明
```

## Docker 服务

- **postgres:** PostgreSQL 15 数据库
- **redis:** Redis 7 缓存服务
- **meilisearch:** MeiliSearch v1.3 搜索引擎
- **backend:** Nest.js 后端服务
- **frontend:** 前端静态站点容器

## 许可证

MIT
