# Annie 网站实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个前后端分离的 Annie AI 助手介绍网站，包含首页、功能详情、开发者文档、博客和联系页面，后端提供认证、对话、博客、文档和反馈 API。

**架构：** 前端使用 React + Vite + Ant Design + Redux Toolkit，后端使用 Node.js + Express + Prisma + PostgreSQL + Redis。前后端通过 RESTful API 通信，使用 JWT 进行认证。

**技术栈：**
- 前端：React.js, Vite, Ant Design, Redux Toolkit, React Router, Tailwind CSS
- 后端：Node.js, Express.js, Prisma, PostgreSQL, Redis, JWT
- 部署：Nginx, PM2, Docker

---

## 文件结构

```
annie-website/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Features.jsx
│       │   ├── Docs.jsx
│       │   ├── Blog.jsx
│       │   ├── Contact.jsx
│       │   └── Auth/
│       │       ├── Login.jsx
│       │       └── Register.jsx
│       ├── components/
│       │   ├── common/
│       │   │   ├── Header.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Loading.jsx
│       │   ├── docs/
│       │   │   ├── DocViewer.jsx与其他元素
│       │   │   └── DocSearch.jsx
│       │   └── blog/
│       │       ├── PostList.jsx
│       │       ├── PostCard.jsx
│       │       └── PostDetail.jsx
│       ├── store/
│       │   ├── index.js
│       │   ├── authSlice.js
│       │   ├── chatSlice.js
│       │   └── blogSlice.js
│       ├── api/
│       │   ├── index.js
│       │   ├── auth.js
│       │   ├── chat.js
│       │   ├── blog.js
│       │   └── docs.js
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useDebounce.js
│       ├── utils/
│       │   ├── colors.js
│       │   └── request.js
│       └── styles/
│           └── globals.css
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   ├── docs/
│   │   ├── getting-started.md
│   │   ├── api/
│   │   │   ├── authentication.md
│   │   │   └── chat.md
│   │   └── examples/
│   │       └── basic-integration.js
│   └── src/
│       ├── index.js
│       ├── config/
│       │   ├── database.js
│       │   └── redis.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── rateLimit.js
│       ├── models/ (由 Prisma 生成)
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── chatController.js
│       │   ├── blogController.js
│       │   ├── docsController.js
│       │   └── feedbackController.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── auth.js
│       │   ├── chat.js
│       │   ├── blog.js
│       │   ├── docs.js
│       │   └── feedback.js
│       ├── services/
│       │   ├── annieService.js
│       │   ├── jwtService.js
│       │   └── docService.js
│       └── utils/
│           ├── logger.js
│           └── validator.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 第一部分：项目初始化

### 任务 1：创建项目根目录和配置文件

**文件：**
- 创建：`annie-website/.gitignore`
- 创建：`annie-website/README.md`
- 创建：`annie-website/docker-compose.yml`

- [ ] **步骤 1：创建 .gitignore 文件**

```bash
# 创建 .gitignore
cat > ~/projects/annie-website/.gitignore << 'EOF'
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Build outputs
frontend/dist/
backend/build/

# Environment files
.env
.env.local
.env.production
frontend/.env
backend/.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Superpowers
.superpowers/
EOF
```

- [ ] **步骤 2：创建 README.md**

```bash
cat > ~/projects/annie-website/README.md << 'EOF'
# Annie 网站

Annie AI 助手介绍网站 - 前后端分离架构

## 技术栈

### 前端
- React.js
- Vite
- Ant Design
- Redux Toolkit
- React Router
- Tailwind CSS

### 后端
- Node.js
- Express.js
- Prisma
- PostgreSQL
- Redis
- JWT

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动启动

#### 后端
```bash
cd backend
npm install
npm run dev
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

## 环境变量

参见 `.env.example` 文件

## 部署

参见 `docs/deployment.md`
EOF
```

- [ ] **步骤 3：创建 docker-compose.yml**

```bash
cat > ~/projects/annie-website/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: annie-postgres
    environment:
      POSTGRES_USER: annie
      POSTGRES_PASSWORD: annie_password
      POSTGRES_DB: annie_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - annie-network

  redis:
    image: redis:7-alpine
    container_name: annie-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - annie-network

  meilisearch:
    image: getmeili/meilisearch:v1.3
    container_name: annie-meilisearch
    environment:
      MEILI_MASTER_KEY: masterKey
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - annie-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: annie-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://annie:annie_password@postgres:5432/annie_db
      REDIS_URL: redis://redis:6379
      MEILISEARCH_URL: http://meilisearch:7700
      JWT_SECRET: your_jwt_secret_here
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
      - meilisearch
    networks:
      - annie-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: annie-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - annie-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:

networks:
  annie-network:
    driver: bridge
EOF
```

- [ ] **步骤 4：提交初始配置**

```bash
cd ~/projects/annie-website
git add .gitignore README.md docker-compose.yml
git commit -m "chore: 添加项目配置文件"
```

---

### 任务 2：初始化后端项目

**文件：**
- 创建：`backend/package.json`
- 创建：`backend/.env.example`
- 创建：`backend/src/index.js`
- 创建：`backend/src/config/database.js`
- 创建：`backend/src/config/redis.js`
- 创建：`backend/prisma/schema.prisma`

- [ ] **步骤 1：创建后端 package.json**

```bash
cd ~/projects/annie-website
mkdir -p backend/src/config backend/prisma

cat > backend/package.json << 'EOF'
{
  "name": "annie-backend",
  "version": "1.0.0",
  "description": "Annie AI 助手后端 API",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "jest"
  },
  "keywords": ["annie", "ai", "assistant"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "redis": "^4.6.11",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "winston": "^3.11.0",
    "meilisearch": "^0.37.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
EOF
```

- [ ] **步骤 2：创建后端 .env.example**

```bash
cat > backend/.env.example << 'EOF'
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://annie:annie_password@localhost:5432/annie_db"

# Redis
REDIS_URL=redis://localhost:6379

# MeiliSearch
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_MASTER_KEY=masterKey

# JWT
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_EXPIRES_IN=7d

# Annie AI Service (根据实际情况配置)
ANNIE_API_URL=http://localhost:8000
ANNIE_API_KEY=your_annie_api_key

# CORS
CORS_ORIGIN=http://localhost:3000
EOF
```

- [ ] **步骤 3：创建后端入口文件**

```bash
cat > backend/src/index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import { initRedis } from './config/redis.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database connected');

    // Initialize Redis
    await initRedis();
    logger.info('Redis connected');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
EOF
```

- [ ] **步骤 4：创建数据库配置**

```bash
cat > backend/src/config/database.js << 'EOF'
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export async function initDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export async function closeDatabase() {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

export default prisma;
EOF
```

- [ ] **步骤 5：创建 Redis 配置**

```bash
cat > backend/src/config/redis.js << 'EOF'
import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

export async function initRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

export function getRedisClient() {
  return redisClient;
}

export default redisClient;
EOF
```

- [ ] **步骤 6：创建 Prisma Schema**

```bash
cat > backend/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  username      String   @unique
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          String   @default("user")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  sessions      Session[]
  profile       Profile?
  posts         Post[]
  feedback      Feedback[]
  chatSessions  ChatSession[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Profile {
  userId       String   @id @map("user_id")
  displayName  String?  @map("display_name")
  avatarUrl    String?  @map("avatar_url")
  bio          String?
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model ChatSession {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  title     String? @default("New Chat")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@map("chat_sessions")
}

model Message {
  id        String   @id @default(uuid())
  sessionId String   @map("session_id")
  role      String // 'user' or 'assistant'
  content   String
  createdAt DateTime @default(now()) @map("created_at")
  
  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Post {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  authorId    String   @map("author_id")
  published   Boolean  @default(false)
  publishedAt DateTime? @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags        PostTag[]

  @@map("posts")
}

model Tag {
  id   String @id @default(uuid())
  name String @unique
  slug String @unique
  
  posts PostTag[]

  @@map("tags")
}

model PostTag {
  postId String @map("post_id")
  tagId  String @map("tag_id")
  
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@map("post_tags")
}

model Feedback {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  name      String?
  email     String?
  subject   String
  message   String
  status    String   @default("pending") // 'pending', 'reviewed', 'resolved'
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("feedback")
}
EOF
```

- [ ] **步骤 7：提交后端基础代码**

```bash
cd ~/projects/annie-website
git add backend/
git commit -m "feat: 初始化后端项目结构和配置"
```## 第二部分：后端基础功能

### 任务 3：创建工具函数和中间件

**文件：**
- 创建：`backend/src/utils/logger.js`
- 创建：`backend/src/utils/validator.js`
- 创建：`backend/src/middleware/auth.js`
- 创建：`backend/src/middleware/rateLimit.js`
- 创建：`backend/src/services/jwtService.js`

- [ ] **步骤 1：创建日志工具**

```bash
cat > backend/src/utils/logger.js << 'EOF'
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'annie-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
EOF
```

- [ ] **步骤 2：创建验证工具**

```bash
cat > backend/src/utils/validator.js << 'EOF'
import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50之间'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密码至少8个字符'),
  validate
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  validate
];

export const sendMessageValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('消息不能为空'),
  validate
];

export const feedbackValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('主题不能为空'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('消息内容不能为空'),
  validate
];
EOF
```

- [ ] **步骤 3：创建 JWT 服务**

```bash
cat > backend/src/services/jwtService.js << 'EOF'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
EOF
```

- [ ] **步骤 4：创建认证中间件**

```bash
cat > backend/src/middleware/auth.js << 'EOF'
import { verifyToken } from '../services/jwtService.js';
import logger from '../utils/logger.js';
import prisma from '../config/database.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '无效或过期的令牌' });
    }

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('认证中间件错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
}
EOF
```

- [ ] **步骤 5：创建速率限制中间件**

```bash
cat > backend/src/middleware/rateLimit.js << 'EOF'
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: '请求过于频繁，请稍后再试',
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

export const apiLimiter = createRateLimiter(15 * 60 * 1000, 100);
export const authLimiter = createRateLimiter(15 * 60 * 1000, 5);
export const chatLimiter = createRateLimiter(1 * 60 * 1000, 20);
EOF
```

- [ ] **步骤 6：提交工具和中间件**

```bash
cd ~/projects/annie-website
git add backend/src/utils/ backend/src/middleware/ backend/src/services/
git commit -m "feat: 添加工具函数和中间件"
```

---

## 第三部分：认证系统实现

### 任务 4：实现认证控制器和路由

**文件：**
- 创建：`backend/src/controllers/authController.js`
- 创建：`backend/src/routes/auth.js`
- 创建：`backend/src/routes/index.js`

- [ ] **步骤 1：创建认证控制器**

```bash
cat > backend/src/controllers/authController.js << 'EOF'
import bcrypt from 'bcryptjs';
import { generateToken } from '../services/jwtService.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用'
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      },
      include: {
        profile: true
      }
    });

    // 生成 token
    const token = generateToken({ userId: user.id, email: user.email.email, role: user.role });

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    logger.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    logger.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true
      }
    });

    res.json({ user });
  } catch (error) {
    logger.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { displayName, bio } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        displayName,
        bio
      },
      update: {
        displayName,
        bio
      }
    });

    res.json({ message: '个人资料更新成功', profile });
  } catch (error) {
    logger.error('更新个人资料错误:', error);
    res.status(500).json({ error: '更新个人资料失败' });
  }
};
EOF
```

- [ ] **步骤 2：创建认证路由**

```bash
cat > backend/src/routes/auth.js << 'EOF'
import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../utils/validator.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// 公开路由（需要限流）
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);

// 需要认证的路由
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);

export default router;
EOF
```

- [ ] **步骤 3：创建主路由文件**

```bash
cat > backend/src/routes/index.js << 'EOF'
import express from 'express';
import authRoutes from './auth.js';

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 各模块路由
router.use('/auth', authRoutes);

// TODO: 添加其他路由
// router.use('/chat', chatRoutes);
// router.use('/blog', blogRoutes);
// router.use('/docs', docsRoutes);
// router.use('/feedback', feedbackRoutes);

export default router;
EOF
```

- [ ] **步骤 4：提交认证系统**

```bash
cd ~/projects/annie-website
git add backend/src/controllers/authController.js backend/src/routes/
git commit -m "feat: 实现认证系统（注册、登录、个人资料）"
```

---

## 第四部分：初始化前端项目

### 任务 5：创建前端项目结构

**文件：**
- 创建：`frontend/package.json`
- 创建：`frontend/vite.config.js`
- 创建：`frontend/tailwind.config.js`
- 创建：`frontend/postcss.config.js`
- 创建：`frontend/index.html`
- 创建：`frontend/.env.example`

- [ ] **步骤 1：创建前端 package.json**

```bash
cd ~/projects/annie-website
mkdir -p frontend/src

cat > frontend/package.json << 'EOF'
{
  "name": "annie-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "axios": "^1.6.2",
    "react-markdown": "^9.0.1",
    "react-syntax-highlighter": "^15.5.0",
    "@ant-design/icons": "^5.2.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.8"
  }
}
EOF
```

- [ ] **步骤 2：创建 Vite 配置**

```bash
cat > frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
EOF
```

- [ ] **步骤 3：创建 Tailwind 配置**

```bash
cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        annie: {
          dark: '#190019',
          purple: '#2b124c',
          midPurple: '#522b5b',
          lightPurple: '#854F6c',
          pink: '#Dfb6b2',
          lightPink: '#Fbe4d8'
        }
      }
    },
  },
  plugins: [],
}
EOF
```

- [ ] **步骤 4：创建 PostCSS 配置**

```bash
cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

- [ ] **步骤 5：创建入口 HTML**

```bash
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Annie AI 助手</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
```

- [ ] **步骤 6：创建环境变量示例**

```bash
cat > frontend/.env.example << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=Annie AI 助手
EOF
```

- [ ] **步骤 7：提交前端基础结构**

```bash
cd ~/projects/annie-website
git add frontend/
git commit -m "feat: 初始化前端项目结构"
```

---

## 第五部分：前端核心组件

### 任务 6：创建前端入口和基础组件

**文件：**
- 创建：`frontend/src/main.jsx`
- 创建：`frontend/src/App.jsx`
- 创建：`frontend/src/index.css`
- 创建：`frontend/src/store/index.js`
- 创建：`frontend/src/store/authSlice.js`

- [ ] **步骤 1：创建入口文件**

```bash
cat > frontend/src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.css';
import App from './App';
import store from './store/index.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: '#522b5b',
        },
      }}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
EOF
```

- [ ] **步骤 2：创建 App 组件**

```bash
cat > frontend/src/App.jsx << 'EOF'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import Home from './pages/Home.jsx';
import Features from './pages/Features.jsx';
import Docs from './pages/Docs.jsx';
import Blog from './pages/Blog.jsx';
import Contact from './pages/Contact.jsx';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh', background: '#Fbe4d8' }}>
        <Header />
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
  );
}

export default App;
EOF
```