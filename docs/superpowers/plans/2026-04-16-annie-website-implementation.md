# Annie 网站实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建 Annie AI 助手介绍网站，包含首页、功能页、文档页、博客页和联系页，后端提供认证、对话、博客、文档和反馈 API。

**架构：** 前端 React + Vite + Ant Design + Redux Toolkit，后端 Node.js + Express + Prisma + PostgreSQL + Redis。

**技术栈：**
- 前端：React, Vite, Ant Design, Redux Toolkit, React Router, Tailwind CSS
- 后端：Node.js, Express, Prisma, PostgreSQL, Redis, JWT

---

## 任务列表

### 任务 1：初始化项目结构

创建根目录配置、Git 配置、Docker Compose 配置。

**文件：**
- `annie-website/.gitignore`
- `annie-website/README.md`
- `annie-website/docker-compose.yml`

### 任务 2：初始化后端项目

创建后端项目结构、package.json、Prisma schema、基础配置。

**文件：**
- `backend/package.json`
- `backend/.env.example`
- `backend/src/index.js`
- `backend/src/config/database.js`
- `backend/src/config/redis.js`
- `backend/prisma/schema.prisma`

### 任务 3：创建工具和中间件

创建日志工具、验证工具、JWT 服务、认证中间件、速率限制中间件。

**文件：**
- `backend/src/utils/logger.js`
- `backend/src/utils/validator.js`
- `backend/src/services/jwtService.js`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/rateLimit.js`

### 任务 4：实现认证系统

创建认证控制器和路由（注册、登录、获取当前用户、更新个人资料）。

**文件：**
- `backend/src/controllers/authController.js`
- `backend/src/routes/auth.js`
- `backend/src/routes/index.js`

### 任务 5：实现对话 API

创建对话控制器和路由（发送消息、获取会话列表、创建/删除会话）。

**文件：**
- `backend/src/controllers/chatController.js`
- `backend/src/services/annieService.js`
- `backend/src/routes/chat.js`

### 任务 6：实现博客 API

创建博客控制器和路由（获取文章列表、文章详情、CRUD 操作）。

**文件：**
- `backend/src/controllers/blogController.js`
- `backend/src/routes/blog.js`

### 任务 7：实现文档 API

创建文档控制器和路由（获取文档内容、搜索文档、文档目录树）。

**文件：**
- `backend/src/controllers/docsController.js`
- `backend/src/services/docService.js`
- `backend/src/routes/docs.js`
- `backend/docs/getting-started.md`
- `backend/docs/api/authentication.md`
- `backend/docs/api/chat.md`

### 任务 8：实现反馈 API

创建反馈控制器和路由（提交反馈、获取反馈列表、更新状态）。

**文件：**
- `backend/src/controllers/feedbackController.js`
- `backend/src/routes/feedback.js`

### 任务 9：初始化前端项目

创建前端项目结构、package.json、Vite 配置、Tailwind 配置。

**文件：**
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/index.html`
- `frontend/.env.example`

### 任务 10：创建前端核心文件

创建入口文件、App 组件、全局样式、Redux store、认证 slice。

**文件：**
- `frontend/src/main.jsx`
- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/src/store/index.js`
- `frontend/src/store/authSlice.js`

### 任务 11：创建前端公共组件

创建 Header、Footer、Loading 等公共组件。

**文件：**
- `frontend/src/components/common/Header.jsx`
- `frontend/src/components/common/Footer.jsx`
- `frontend/src/components/common/Loading.jsx`

### 任务 12：创建页面组件

创建首页、功能页、文档页、博客页、联系页。

**文件：**
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Features.jsx`
- `frontend/src/pages/Docs.jsx`
- `frontend/src/pages/Blog.jsx`
- `frontend/src/pages/Contact.jsx`

### 任务 13：创建认证页面组件

创建登录页和注册页。

**文件：**
- `frontend/src/pages/Auth/Login.jsx`
- `frontend/src/pages/Auth/Register.jsx`

### 任务 14：创建 API 封装

创建前端 API 请求封装和各个模块的 API 函数。

**文件：**
- `frontend/src/api/index.js`
- `frontend/src/api/auth.js`
- `frontend/src/api/chat.js`
- `frontend/src/api/blog.js`
- `frontend/src/api/docs.js`

### 任务 15：创建自定义 Hooks

创建认证相关的 Hooks。

**文件：**
- `frontend/src/hooks/useAuth.js`
- `frontend/src/hooks/useDebounce.js`

### 任务 16：创建样式和工具函数

创建颜色配置和工具函数。

**文件：**
- `frontend/src/utils/colors.js`
- `frontend/src/utils/request.js`

### 任务 17：添加文档和示例

添加开发者文档内容和示例代码。

**文件：**
- `backend/docs/getting-started.md`
- `backend/docs/api/authentication.md`
- `backend/docs/api/chat.md`
- `backend/docs/examples/basic-integration.js`

### 任务 18：创建 Docker 镜像配置

创建前后端的 Dockerfile。

**文件：**
- `backend/Dockerfile`
- `frontend/Dockerfile`

### 任务 19：数据库迁移和种子数据

运行 Prisma 迁移，添加初始数据（示例博客文章、标签）。

### 任务 20：测试和验证

测试前后端功能，验证 API 端点，检查前端页面渲染。

### 任务 21：部署准备

创建部署脚本、Nginx 配置、SSL 证书配置说明。

**文件：**
- `scripts/deploy.sh`
- `nginx.conf.example`
- `docs/deployment.md`

---

## 执行顺序说明

1. **任务 1-8**：完成后端核心功能
2. **任务 9-16**：完成前端核心功能
3. **任务 17-18**：添加文档和 Docker 配置
4. **任务 19-21**：测试和部署准备

每个任务完成后应进行 git commit，保持版本控制清晰。
