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
- **部署方式:** GitHub 拉取 + `setup-server.sh` / `deploy-app.sh`

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

适合单独调试前后端代码。此模式下数据库、Redis、MeiliSearch 应运行在本机，连接地址使用 `localhost`。

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
- 推荐把本地开发配置维护在项目根目录 `.env.local`。
- 前端开发服务器默认运行在 http://localhost:5173。

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

使用 `.env.local`，本机服务通过 `localhost` 连接：

- `DATABASE_URL` 使用 `localhost:5432`
- `REDIS_URL` 使用 `localhost:6379`
- `MEILISEARCH_URL` 使用 `localhost:7700`
- 后端监听端口使用 `PORT`

推荐做法：

```bash
cp .env.local.example .env.local
```

### 部署

生产环境使用部署脚本和 `deploy.env`，不要直接复用本地开发环境文件。

首次部署通常分两步：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

更完整的部署说明见：

- [DEPLOYMENT-QUICKSTART.md](/Users/yanlin/projects/annie-website/DEPLOYMENT-QUICKSTART.md)
- [docs/deployment.md](/Users/yanlin/projects/annie-website/docs/deployment.md)

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
```

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
