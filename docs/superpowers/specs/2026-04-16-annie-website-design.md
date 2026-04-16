# Annie 网站设计文档

**创建日期：** 2026-04-16
**项目名称：** Annie 介绍网站
**部署目标：** 阿里云服务器

## 1. 项目概述

为 Annie AI 助手创建一个前后端分离的介绍网站，展示产品功能、提供开发者文档，并支持在线体验。

## 2. 目标用户

- **开发者/技术人员**：关注 API 集成、、代码示例
- **普通用户**：关注产品功能、使用场景、如何开始使用

## 3. 视觉设计

### 配色方案
- 主色调：深紫色渐变
  - `#190019` — 最深紫色（文字、标题）
  - `#2b124c` — 深紫色（导航栏背景）
  - `#522b5b` — 中紫色（Hero 背景）
  - `#854F6c` — 浅紫色
  - `#Dfb6b2` — 浅粉紫色（卡片背景）
  - `#Fbe4d8` — 最浅粉紫色（页面背景）

### 设计风格
- **定位**：现代科技 × 温暖友好
- **特点**：深紫色系带来科技感和专业感，粉色系增添温暖和亲和力
- **氛围**：既有技术实力，又有人性化的关怀，非常适合 AI 助手展示

## 4. 前端页面设计

### 4.1 首页介绍
**内容：**
- 产品概述：Annie 是什么，能做什么
- 核心卖点：3-5 个主要优势
- 快速开始：引导用户注册或试用
- 视觉元素：Hero 区域使用深紫色渐变背景

### 4.2 功能详情页
**内容：**
- 详细功能列表
- 每个功能的使用场景
- 功能对比或特色说明
- 视觉化展示：截图、动画或交互演示

### 4.3 开发者文档
**内容：**
- 快速开始指南
- API 文档：接口说明、参数、返回值
- 集成示例代码（多语言）
- SDK 使用说明
- 常见问题 FAQ
- 搜索功能：支持文档全文搜索

### 4.4 博客/新闻
**内容：**
- 产品更新日志
- 技术文章
- 使用技巧和最佳实践
- 标签分类系统
- 文章列表和详情页

### 4.5 联系我们
**内容：**
- 联系方式：邮箱、社交媒体
- 反馈表单：用户可以提交建议或问题
- FAQ 常见问题
- 技术支持链接

## 5. 后端功能设计

### 5.1 Annie 对话 API
**功能：**
- 提供与 Annie AI 助手对话的 RESTful API
- 支持流式响应（SSE）和普通响应
- 对话历史管理
- 会话上下文保持
- 请求限流和配额管理

**API 端点设计：**
- `POST /api/v1/chat/{session_id}` — 发送消息并获取回复
- `GET /api/v1/sessions` — 获取用户的所有会话
- `POST /api/v1/sessions` — 创建新会话
- `DELETE /api/v1/sessions/{session_id}` — 删除会话

### 5.2 用户认证系统
**功能：**
- 用户注册（邮箱/用户名）
- 用户登录（支持 JWT Token）
- 密码重置
- 权限管理（普通用户、开发者、管理员）
- 个人资料管理
- OAuth 集成（可选：GitHub、Google）

**数据库模型：**
- User 表：id, username, email, password_hash, role, created_at
- Session 表：id, user_id, token, expires_at
- Profile 表：user_id, display_name, avatar, bio

### 5.3 文档渲染服务
**功能：**
- Markdown 文档解析和渲染
- 代码高亮
- 文档分类和目录结构
- 全文搜索（支持中文）
- 版本管理（可选）

**技术实现：**
- 使用 Markdown 解析器（如 marked.js）
- 静态文档存储或数据库存储
- 搜索引擎集成（如 MeiliSearch 或 Elasticsearch）

## 6. 技术栈

### 前端
- **框架：** React.js
- **UI 组件库：** Ant Design
- **状态管理：** Redux Toolkit
- **路由：** React Router
- **构建工具：** Vite
- **样式：** Tailwind CSS

### 后端
- **框架：** Nest.js + TypeScript
- **数据库：** PostgreSQL
- **ORM：** Prisma
- **缓存：** Redis
- **搜索：** MeiliSearch
- **认证：** JWT
- **验证：** class-validator + class-transformer

### 部署
- **前端：** Nginx 静态文件服务 + CDN
- **后端：** PM2 或 Docker 容器化
- **数据库：** PostgreSQL 独立部署
- **反向代理：** Nginx
- **SSL：** Let's Encrypt

## 7. 项目结构

```
annie-website/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 可复用组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── styles/          # 样式文件
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   ├── docs/                # 文档内容（Markdown）
│   └── package.json
└── docker-compose.yml        # Docker 部署配置
```

## 8. 数据模型

### 用户相关
```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会话表
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 个人资料表
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 对话相关
```sql
-- 对话会话表
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 对话消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 博客相关
```sql
-- 博客文章表
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES users(id),
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE tags (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 文章-标签关联表
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id),
    tag_id UUID REFERENCES tags(id),
    PRIMARY KEY (post_id, tag_id)
);
```

### 反馈相关
```sql
-- 反馈表
CREATE TABLE feedback (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(100),
    email VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 9. API 设计

### 认证 API
- `POST /api/v1/auth/register` — 用户注册
- `POST /api/v1/auth/login` — 用户登录
- `POST /api/v1/auth/logout` — 用户登出
- `POST /api/v1/auth/refresh` — 刷新 Token
- `POST /api/v1/auth/reset-password` — 重置密码

### 对话 API
- `POST /api/v1/chat/{session_id}` — 发送消息
- `GET /api/v1/chat/sessions` — 获取所有会话
- `POST /api/v1/chat/sessions` — 创建新会话
- `GET /api/v1/chat/sessions/{session_id}` — 获取会话详情
- `DELETE /api/v1/chat/sessions/{session_id}` — 删除会话

### 博客 API
- `GET /api/v1/blog/posts` — 获取文章列表
- `GET /api/v1/blog/posts/{slug}` — 获取文章详情
- `POST /api/v1/blog/posts` — 创建文章（管理员）
- `PUT /api/v1/blog/posts/{slug}` — 更新文章（管理员）
- `DELETE /api/v1/blog/posts/{slug}` — 删除文章（管理员）
- `GET /api/v1/blog/tags` — 获取所有标签

### 文档 API
- `GET /api/v1/docs/{path}` — 获取文档内容
- `GET /api/v1/docs/search` — 搜索文档
- `GET /api/v1/docs/tree` — 获取文档目录树

### 反馈 API
- `POST /api/v1/feedback` — 提交反馈
- `GET /api/v1/feedback` — 获取反馈列表（管理员）
- `PUT /api/v1/feedback/{id}` — 更新反馈状态（管理员）

## 10. 安全考虑

- 所有 API 请求使用 HTTPS
- 敏感数据使用加密存储
- 实现请求限流（Rate Limiting）
- CORS 配置限制允许的域名
- 输入验证和防 SQL 注入
- XSS 防护
- 敏感操作记录审计日志

## 11. 性能优化

- 前端资源压缩和懒加载
- API 响应缓存（Redis）
- 数据库查询优化和索引
- 静态资源 CDN 加速
- 图片压缩和格式优化

## 12. 部署流程

1. 准备阿里云服务器
2. 安装必要软件（Node.js、PostgreSQL、Redis、Nginx）
3. 配置数据库和 Redis
4. 部署后端服务（PM2 或 Docker）
5. 构建并部署前端（Nginx 静态服务）
6. 配置 SSL 证书
7. 配置域名和 DNS 解析
8. 设置监控和日志收集

## 13. 后续扩展可能性

- 添加定价和支付功能
- 多语言支持（i18n）
- 移动端 App 集成
- 更多第三方登录方式
- Webhook 支持
- 数据分析仪表板
