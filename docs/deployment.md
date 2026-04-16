# 部署指南

本文档介绍如何将 Annie 网站部署到生产环境。

## 部署架构

```
┌─────────────┐
│    Nginx   │ (反向代理 + SSL)
│   :443/80   │
└──────┬──────┘
       │
       ├─────┬────────┬────────
       │     │        │        │
┌──────▼────┐ ┌─▼──────┐ ┌▼──────┐ ┌▼──────┐
│  Docker    │ │Postgres│ │ Redis  │ │MeiliSearch│
│  Compose  │ │:5432   │ │:6379   │ │:7700     │
│            │ └────────┘ └────────┘ └──────────┘
│  ┌────┬──▼┐
│  │Front │Back│
│  │:3000 │:3001│
│  └──────┴─────┘
└─────────────┘
```

## 前提条件

- 阿里云服务器（或其他 Linux 服务器）
- 域名和 SSL 证书
- Docker 和 Docker Compose 已安装

## 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 克隆代码

```bash
# 克隆仓库
Git clone https://github.com/your-username/annie-website.git
cd annie-website
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
cp backend/.env.example backend/.env

# 编辑环境变量
nano .env
```

**必需的环境变量：**

```bash
# 服务器配置
NODE_ENV=production
BACKEND_PORT=3000

# 数据库配置（生成强密码）
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=annie_db

# JWT 密钥（生成强密钥）
JWT_SECRET=$(openssl rand -base64 32)

# MeiliSearch 密钥（生成强密钥）
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 32)

# CORS 配置
CORS_ORIGIN=https://your-domain.com

# Annie API 配置
ANNIE_API_URL=https://annie-api.example.com
ANNIE_API_KEY=your-annie-api-key
```

### 4. 配置 SSL 证书（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 证书路径
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 5. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/annie-website`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/annie-access.log;
    error_log /var/log/nginx/annie-error.log;

    # 代理到 Docker Compose
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # API 代理（可选，用于直接访问后端）
    location /.well-known {
        root /var/www/html;
    }
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/annie-website /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 7. 初始化数据库

```bash
# 进入后端容器
docker-compose exec backend bash

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 退出容器
exit
```

### 8. 设置自动续期 SSL

```bash
# 测试续期
sudo certbot renew --dry-run

# 添加自动续期任务
sudo crontab -e

# 添加以下行（每周一凌晨 2 点检查）
0 2 * * 1 certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 监控和维护

### 查看服务状态

```bash
# Docker 服务
docker-compose ps

# Nginx 服务
sudo systemctl status nginx

# Docker 容器资源使用
docker stats
```

### 查看日志

```bash
# 应用日志
docker-compose logs -f backend frontend

# Nginx 访问日志
sudo tail -f /var/log/nginx/annie-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/annie-error.log
```

### 备份数据库

```bash
# 创建备份目录
mkdir -p ~/backups

# 备份数据库
docker-compose exec postgres pg_dump -U annie annie_db > ~/backups/annie_db_$(date +%Y%m%d).sql

# 压缩备份
gzip ~/backups/annie_db_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# 解压备份
gunzip ~/backups/annie_db_20240116.sql.gz

# 恢复数据库
docker-compose exec -T postgres psql -U annie annie_db < ~/backups/annie_db_20240116.sql
```

## 故障排除

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs backend

# 检查容器内部
docker-compose exec backend sh

# 检查环境变量
docker-compose exec backend env
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否就绪
docker-compose exec postgres pg_isready -U annie

# 查看数据库日志
docker-compose logs postgres
```

### Nginx 代理问题

```bash
# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 性能优化

### 配置 Redis 持久化

```docker
# 在 docker-compose.yml 中
redis:
  command: redis-server --appendonly yes --appendfsync everysec
```

### 配置 PostgreSQL 性能

```sql
-- 创建索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_messages_session_id ON messages(session_id);
```

### 配置 Nginx 缓存

```nginx
# 在 Nginx 配置中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=annie_cache:10m max_size=1g inactive=60m;

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    proxy_pass http://localhost:3000;
    proxy_cache annie_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_bypass $http_upgrade;
}
```

## 安全建议

1. **定期更新**：保持系统和 Docker 镜像更新
2. **监控日志**：使用日志聚合工具（如 ELK、Graylog）
3. **防火墙**：只开放必要端口（80、443）
4. **强密码**：使用强密码并定期更换
5. **备份**：定期备份数据库和重要文件
6. **限流**：配置 API 速率限制防止滥用
7. **HTTPS**：强制使用 HTTPS
8. **CORS**：严格配置 CORS 白名单

## 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 重启 Nginx（如果配置更改）
sudo systemctl reload nginx
```
