# Annie 网站环境变量配置方案

## 概述

本文档详细说明了部署 Annie 网站应用所需的所有环境变量及其配置方法。

## 环境变量分类

### 1. 部署脚本环境变量

#### 服务器连接配置

```bash
# 服务器信息
SSH_HOST=your-server-ip-or-domain    # 服务器IP地址或域名
SSH_USER=ubuntu                      # SSH登录用户名（推荐非root用户）
SSH_KEY=/path/to/your/private/key     # SSH私钥文件路径
DOMAIN=your-domain.com               # 网站域名
```

#### 数据库和安全配置

```bash
# 数据库密码（生产环境必须修改）
POSTGRES_PASSWORD=your-secure-db-password-here

# JWT密钥（生产环境必须修改）
JWT_SECRET=your-very-secure-jwt-secret-here

# MeiliSearch管理密钥（生产环境必须修改）
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
```

#### SSL证书配置（setup-server.sh专用）

```bash
# Docker镜像加速（阿里云或其他）
ALIYUN_MIRROR=https://your-registry-mirror.com

# SSL证书文件路径
SSL_CERT_PATH=/path/to/your/certificate.pem
SSL_KEY_PATH=/path/to/your/private.key
```

### 2. 应用运行时环境变量

#### 基础配置

```bash
# 运行环境
NODE_ENV=production

# 后端服务端口
BACKEND_PORT=3001
```

#### 数据库配置

```bash
# 数据库连接信息
POSTGRES_USER=annie
POSTGRES_PASSWORD=your-secure-db-password-here
POSTGRES_DB=annie_db

# Prisma数据库URL（自动生成）
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public
```

#### 缓存和搜索配置

```bash
# Redis连接
REDIS_URL=redis://redis:6379

# MeiliSearch配置
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
MEILI_MASTER_KEY=your-secure-meilisearch-key-here
```

#### 安全配置

```bash
# JWT配置
JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://your-domain.com
```

#### AI服务配置

```bash
# Annie AI服务（可选）
ANNIE_API_URL=https://annie-api.your-domain.com
ANNIE_API_KEY=your-annie-api-key
```

## 环境变量准备方案

### 方案一：本地宿主机启动（`.env.local`）

这个方案适合你在本机直接运行后端和前端时使用。

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```bash
NODE_ENV=development
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

### 方案二：本地 Docker Compose 启动（`.env.docker`）

这个方案适合你使用 `docker compose` 启动时，容器间通过服务名互联。

```bash
cp .env.docker.example .env.docker
```

编辑 `.env.docker`：

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

运行 Docker Compose 时使用：

```bash
docker compose --env-file .env.docker up -d
```

### 方案三：生产部署环境

生产部署请继续使用 `deploy.env` 或你自己的部署环境配置文件。这里的本地开发与本地 Docker 启动配置不应直接用于生产。 

### 方案四：使用环境变量脚本

#### 1. 创建环境变量设置脚本

```bash
#!/bin/bash
# env-setup.sh

# 导出所有环境变量
export SSH_HOST="your-server-ip"
export SSH_USER="ubuntu"
export SSH_KEY="/path/to/your/private/key"
export DOMAIN="your-domain.com"
export POSTGRES_PASSWORD="your-secure-db-password"
export JWT_SECRET="your-very-secure-jwt-secret"
export MEILISEARCH_MASTER_KEY="your-secure-meilisearch-key"
export ALIYUN_MIRROR="https://your-registry-mirror.com"
export SSL_CERT_PATH="/path/to/your/certificate.pem"
export SSL_KEY_PATH="/path/to/your/private.key"

echo "环境变量已设置完成"
```

#### 3. 创建后端专用环境变量文件

```bash
# 编辑 backend/.env 文件
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key-here
MEILI_MASTER_KEY=your-secure-meilisearch-key-here
JWT_SECRET=your-very-secure-jwt-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

### 方案二：使用环境变量脚本

#### 1. 创建环境变量设置脚本

```bash
#!/bin/bash
# env-setup.sh

# 导出所有环境变量
export SSH_HOST="your-server-ip"
export SSH_USER="ubuntu"
export SSH_KEY="/path/to/your/private/key"
export DOMAIN="your-domain.com"
export POSTGRES_PASSWORD="your-secure-db-password"
export JWT_SECRET="your-very-secure-jwt-secret"
export MEILISEARCH_MASTER_KEY="your-secure-meilisearch-key"
export ALIYUN_MIRROR="https://your-registry-mirror.com"
export SSL_CERT_PATH="/path/to/your/certificate.pem"
export SSL_KEY_PATH="/path/to/your/private.key"

echo "环境变量已设置完成"
```

#### 2. 使用脚本设置环境变量

```bash
# 加载环境变量
source env-setup.sh

# 运行部署脚本
./scripts/setup-server.sh
./scripts/deploy-app.sh
```

### 方案三：使用 Docker 环境文件

#### 1. 创建部署环境文件

```bash
# 创建 deploy.env 文件
SSH_HOST=your-server-ip
SSH_USER=ubuntu
SSH_KEY=/path/to/your/private/key
DOMAIN=your-domain.com
POSTGRES_PASSWORD=your-secure-db-password
JWT_SECRET=your-very-secure-jwt-secret
MEILISEARCH_MASTER_KEY=your-secure-meilisearch-key
ALIYUN_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/path/to/your/certificate.pem
SSL_KEY_PATH=/path/to/your/private.key
```

#### 2. 使用环境文件运行脚本

```bash
# 使用环境文件运行部署
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

## 安全密钥生成方法

### 生成安全的随机密钥

#### JWT Secret

```bash
# 生成32字节的随机密钥
openssl rand -hex 32
# 或
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 数据库密码

```bash
# 生成16字节的随机密码
openssl rand -hex 16
# 或使用pwgen（如果安装了）
pwgen -s 16 1
```

#### MeiliSearch Master Key

```bash
# 生成32字节的随机密钥
openssl rand -hex 32
```

### 示例生成的密钥

```bash
# 不要使用这些示例密钥，生成你自己的！
JWT_SECRET=8f2e4c8d9a3b7f6e1d5c9a2b8f4e6c1d3a7b9f2e4c8d6a1b3f7e9c2d5a8b4f6e
POSTGRES_PASSWORD=4a9b2c7d5e8f1a3b6c9d2e5f8a1b4c7d9e2f5a8b1c4d7e9f2a5b8c1d4e7f9a2b
MEILISEARCH_MASTER_KEY=3f7a9c2e5b8d1f4a6c9e2b5d8f1a4c7e9b2f5a8c1d4e7b9f2a5c8d1e4f7a9b3c
```

## SSL证书准备

### 使用Let's Encrypt（推荐）

```bash
# 安装certbot
sudo apt install certbot

# 生成证书
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 证书路径通常是：
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 使用自签名证书（开发环境）

```bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.pem -days 365 -nodes -subj "/CN=your-domain.com"

SSL_CERT_PATH=./certificate.pem
SSL_KEY_PATH=./private.key
```

## SSH密钥准备

### 生成SSH密钥对

```bash
# 生成RSA密钥对
ssh-keygen -t rsa -b 4096 -C "your-email@example.com" -f ~/.ssh/annie-deploy

# 或生成Ed25519密钥对（推荐）
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/annie-deploy

# 设置正确的权限
chmod 600 ~/.ssh/annie-deploy
chmod 644 ~/.ssh/annie-deploy.pub
```

### 配置SSH密钥

```bash
# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/annie-deploy.pub user@your-server-ip

# 或手动添加
cat ~/.ssh/annie-deploy.pub | ssh user@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 设置环境变量
SSH_KEY=~/.ssh/annie-deploy
```

## 部署前检查清单

- [ ] SSH密钥已生成并配置到服务器
- [ ] SSL证书已准备就绪
- [ ] 所有密码和密钥已生成（不要使用默认值）
- [ ] 域名DNS已正确配置
- [ ] 服务器防火墙已开放必要端口（22, 80, 443）
- [ ] Docker镜像加速已配置
- [ ] 环境变量文件已创建并配置

## 快速开始模板

### 1. 生成安全密钥

```bash
#!/bin/bash
# generate-secrets.sh

echo "生成安全密钥..."

JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)
MEILI_KEY=$(openssl rand -hex 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "POSTGRES_PASSWORD=$DB_PASSWORD"
echo "MEILISEARCH_MASTER_KEY=$MEILI_KEY"

# 保存到文件
cat > secrets.env << EOF
JWT_SECRET=$JWT_SECRET
POSTGRES_PASSWORD=$DB_PASSWORD
MEILISEARCH_MASTER_KEY=$MEILI_KEY
EOF

echo "密钥已保存到 secrets.env 文件"
```

### 2. 创建部署配置

```bash
#!/bin/bash
# setup-deployment.sh

# 加载生成的密钥
source secrets.env

# 创建部署环境文件
cat > deploy.env << EOF
SSH_HOST=your-server-ip
SSH_USER=ubuntu
SSH_KEY=~/.ssh/annie-deploy
DOMAIN=your-domain.com
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
MEILISEARCH_MASTER_KEY=$MEILI_KEY
ALIYUN_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
EOF

echo "部署配置已创建：deploy.env"
```

### 3. 执行部署

```bash
# 加载环境变量并部署
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

## 注意事项

1. **安全性**：永远不要将包含真实密钥的文件提交到版本控制系统
2. **备份**：定期备份你的环境变量配置
3. **轮换**：定期轮换JWT密钥和数据库密码
4. **权限**：确保环境变量文件权限正确（600）
5. **环境隔离**：为不同环境（开发/测试/生产）使用不同的密钥

按照此方案配置后，你就可以安全地部署 Annie 网站应用了！
