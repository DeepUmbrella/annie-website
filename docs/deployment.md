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

- Linux 服务器
- 域名
- SSL 证书文件
- Docker 和 Docker Compose 已安装

## 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
#（根据你的发行版选择合适的安装方式）

# 安装 Docker Compose
#（使用官方二进制或系统包管理器）

# 验证安装
docker --version
docker-compose --version
```

### 2. 获取代码

如果使用 GitHub 仓库部署：

```bash
git clone <repository-url>
cd <project-directory>
```

### 3. 配置环境变量

创建并编辑环境变量文件，至少包含：

```bash
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://<your-domain>
POSTGRES_USER=annie
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:<strong-password>@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=<strong-key>
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=7d
ANNIE_API_URL=https://<annie-api-host>
ANNIE_API_KEY=<annie-api-key>
```

> 建议将这些变量放入 `.env` 和 `backend/.env`，并确保不要提交到版本控制。

### 4. 配置 SSL 证书

将证书放到服务器上的安全目录，例如：

```bash
/etc/nginx/ssl/
```

证书文件通常包括：

- `your-domain.crt`
- `your-domain.key`

### 5. 配置 Nginx

创建站点配置文件，例如：

```nginx
server {
    listen 80;
    server_name <your-domain> www.<your-domain>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name <your-domain> www.<your-domain>;

    ssl_certificate /etc/nginx/ssl/<your-domain>.crt;
    ssl_certificate_key /etc/nginx/ssl/<your-domain>.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. 启动服务

```bash
docker-compose up -d --build
docker-compose ps
docker-compose logs -f
```

### 7. 初始化数据库

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 8. 设置自动续期 SSL

使用你的证书供应商或 Certbot 的自动续期机制，定期更新证书并重载 Nginx。

## 监控和维护

### 查看服务状态

```bash
docker-compose ps
systemctl status nginx
docker stats
```

### 查看日志

```bash
docker-compose logs -f backend frontend
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 备份数据库

```bash
mkdir -p ~/backups
docker-compose exec postgres pg_dump -U annie annie_db > ~/backups/annie_db_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U annie annie_db < backup.sql
```

## 故障排除

### 容器无法启动

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose ps
```

### 数据库连接失败

```bash
docker-compose exec postgres pg_isready -U annie
docker-compose logs postgres
```

### Nginx 配置问题

```bash
nginx -t
systemctl reload nginx
tail -f /var/log/nginx/error.log
```

## 安全建议

- 使用强密码和强密钥
- 不要将 `.env` 提交到仓库
- 定期备份数据库
- 定期更新系统和依赖
- 仅开放必要端口

## 更新部署

```bash
git pull origin main
docker-compose up -d --build
systemctl reload nginx
```
