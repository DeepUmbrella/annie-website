# Annie Website

Annie AI 助手介绍网站 - 前后端分离架构

## 技术栈

### 前端
- **框架:** React 18
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
- **反向代理:** Nginx
- **部署方式:** GitHub 拉取 + setup/deploy 两步脚本

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd annie-website
```

### 2. 配置环境变量与其他

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置必要的环境变量
# - POSTGRES_PASSWORD: 数据库密码
# - MEILI_MASTER_KEY: MeiliSearch 主密钥
# - JWT_SECRET: JWT 签名密钥
```

### 3. 启动服务

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d

# 查看服务日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:4000
- MeiliSearch: http://localhost:7700

## 手动动启动（不使用 Docker）

### 后端

```bash
cd backend
npm install
npm run dev
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
annie-website/
├── frontend/          # React 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 可复用组件
│   │   ├── store/           # Redux store
│   │   ├── api/             # API 请求封装
│   │   └── hooks/           # 自定义 Hooks
│   └── package.json
├── backend (Nest.js 后端 API)
│   ├── src/
│   │   ├── modules/          # 业务模块
│   │   │   ├── auth/         # 认证模块
│   │   │   ├── chat/         # 对话模块
│   │   │   ├── blog/         # 博客模块
│   │   │   ├── docs/         # 文档模块
│   │   │   └── feedback/     # 反馈模块
│   │   ├── common/           # 公共模块
│   │   │   ├── guards/       # 守卫
│   │   │   ├── decorators/   # 装饰器
│   │   │   ├── filters/      # 异常过滤器
│   │   │   ├── interceptors/ # 拦截器
│   │   │   └── pipes/        # 管道
│   │   ├── config/           # 配置
│   │   ├── database/         # 数据库
│   │   └── main.ts           # 入口文件
│   ├── prisma/               # Prisma 配置
│   └── package.json
├── docs/              # 项目文档
├── docker-compose.yml # Docker 服务配置
└── README.md          # 项目说明
```

## Docker 服务

- **postgres:** PostgreSQL 15 数据库
- **redis:** Redis 7 缓存服务
- **meilisearch:** MeiliSearch v1.3 搜索引擎
- **backend:** Nest.js 后端服务
- **frontend:** React 前端服务

## 开发命令

### 后端

```bash
cd backend
npm install
npm run dev       # 开发模式
npm run build     # 构建
npm run start     # 生产环境
npm run test      # 测试
npm run test:e2e  # 端到端测试
```

### 前端

```bash
cd frontend
npm install
npm run dev       # 开发模式
npm run build     # 构建
npm run preview   # 预览构建结果
npm run lint      # 代码检查
```

## 环境变量

参见 `.env.example` 文件了解所有可配置的环境变量。

## 部署

### 服务器首次环境设置

```bash
export SSH_HOST=<server-ip>
export SSH_USER=<ssh-user>
export SSH_KEY=<path-to-ssh-key>
export DOMAIN=<your-domain>
export ALIYUN_MIRROR=<docker-mirror-url>
export SSL_CERT_PATH=<path-to-ssl-cert.pem>
export SSL_KEY_PATH=<path-to-ssl-key.pem>

bash scripts/setup-server.sh
```

### 应用部署（从 GitHub 拉取代码）

```bash
export SSH_HOST=<server-ip>
export SSH_USER=<ssh-user>
export SSH_KEY=<path-to-ssh-key>
export DOMAIN=<your-domain>
export POSTGRES_PASSWORD=<strong-password>
export JWT_SECRET=<strong-secret>
export MEILISEARCH_MASTER_KEY=<strong-key>

bash scripts/deploy-app.sh
```

详细说明参见 `docs/deployment.md`。

## 许可证

MIT
