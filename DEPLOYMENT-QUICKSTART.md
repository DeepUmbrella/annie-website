# Annie 网站部署环境变量配置指南

## 🚀 快速开始

### 自动配置（推荐）

1. **运行环境变量配置脚本**

   ```bash
   # 在项目根目录运行
   ./scripts/setup-env.sh
   ```

   这个脚本会自动：
   - 生成SSH密钥对
   - 生成安全的随机密码和密钥
   - 创建所有必要的环境变量文件
   - 配置 .gitignore 忽略敏感文件

2. **编辑部署配置**

   ```bash
   # 编辑生成的 deploy.env 文件
   nano deploy.env  # 或使用你喜欢的编辑器
   ```

   修改以下配置：

   ```bash
   SSH_HOST=你的服务器IP或域名
   SSH_USER=ubuntu  # 或你的服务器用户名
   DOMAIN=你的域名.com
   ALIYUN_MIRROR=https://你的阿里云镜像加速地址
   SSL_CERT_PATH=/path/to/your/certificate.pem
   SSL_KEY_PATH=/path/to/your/private.key
   ```

3. **上传SSH公钥到服务器**

   ```bash
   # 将生成的公钥上传到服务器
   ssh-copy-id -i ~/.ssh/annie-deploy.pub user@your-server-ip

   # 或者手动添加
   cat ~/.ssh/annie-deploy.pub | ssh user@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```

4. **运行部署**

   ```bash
   # 服务器初始化（只需运行一次）
   env $(cat deploy.env | xargs) ./scripts/setup-server.sh

   # 应用部署
   env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
   ```

## 📋 手动配置步骤

如果你不想使用自动脚本，也可以手动配置：

### 1. 生成安全密钥

```bash
# 生成JWT密钥 (32字节)
JWT_SECRET=$(openssl rand -hex 32)

# 生成数据库密码 (16字节)
POSTGRES_PASSWORD=$(openssl rand -hex 16)

# 生成MeiliSearch密钥 (32字节)
MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "MEILISEARCH_MASTER_KEY=$MEILISEARCH_MASTER_KEY"
```

### 2. 创建环境变量文件

#### 主环境变量文件 (.env)

```bash
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://your-domain.com
POSTGRES_USER=annie
POSTGRES_PASSWORD=your-generated-password
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-generated-key
MEILI_MASTER_KEY=your-generated-key
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=7d
ANNIE_API_URL=https://annie-api.your-domain.com
ANNIE_API_KEY=your-annie-api-key
```

#### 后端专用环境变量 (backend/.env)

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://annie:your-password@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-generated-key
MEILI_MASTER_KEY=your-generated-key
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

#### 部署配置 (deploy.env)

```bash
SSH_HOST=your-server-ip
SSH_USER=ubuntu
SSH_KEY=~/.ssh/annie-deploy
DOMAIN=your-domain.com
POSTGRES_PASSWORD=your-generated-password
JWT_SECRET=your-generated-secret
MEILISEARCH_MASTER_KEY=your-generated-key
ALIYUN_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 3. 生成SSH密钥

```bash
# 生成Ed25519密钥对（推荐）
ssh-keygen -t ed25519 -C "annie-deploy@your-email.com" -f ~/.ssh/annie-deploy -N ""

# 设置权限
chmod 600 ~/.ssh/annie-deploy
chmod 644 ~/.ssh/annie-deploy.pub
```

### 4. 配置SSL证书

#### 使用Let's Encrypt（推荐）

```bash
# 在服务器上安装certbot
sudo apt install certbot

# 生成证书
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

#### 使用自签名证书（仅开发环境）

```bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.pem -days 365 -nodes -subj "/CN=your-domain.com"
```

## 🔐 安全注意事项

1. **不要提交敏感文件到Git**
   - `.env`
   - `backend/.env`
   - `deploy.env`
   - `secrets.env`
   - `*.key`
   - `*.pem`

2. **定期轮换密钥**
   - JWT密钥：建议每3个月轮换
   - 数据库密码：建议每6个月轮换
   - MeiliSearch密钥：根据安全需求轮换

3. **文件权限**

   ```bash
   # 环境变量文件
   chmod 600 .env backend/.env deploy.env

   # SSH私钥
   chmod 600 ~/.ssh/annie-deploy

   # SSL证书
   chmod 644 /etc/nginx/ssl/*.crt
   chmod 600 /etc/nginx/ssl/*.key
   ```

## 📁 生成的文件结构

运行自动配置脚本后，你会得到：

```
annie-website/
├── .env                    # 主环境变量
├── backend/
│   └── .env               # 后端专用环境变量
├── deploy.env             # 部署配置
├── secrets.env            # 密钥备份（不要提交）
├── scripts/
│   └── setup-env.sh       # 环境配置脚本
└── ~/.ssh/
    ├── annie-deploy       # SSH私钥
    └── annie-deploy.pub   # SSH公钥
```

## 🚨 故障排除

### SSH连接问题

```bash
# 测试SSH连接
ssh -i ~/.ssh/annie-deploy user@your-server-ip

# 如果连接失败，检查：
# 1. 公钥是否正确添加到服务器
# 2. 服务器防火墙是否开放22端口
# 3. SSH服务是否运行
```

### SSL证书问题

```bash
# 检查证书文件是否存在
ls -la /etc/letsencrypt/live/your-domain.com/

# 测试nginx配置
sudo nginx -t

# 重新加载nginx
sudo systemctl reload nginx
```

### Docker镜像问题

```bash
# 检查镜像加速配置
docker info --format '{{json .RegistryConfig.Mirrors}}'

# 如果没有配置，重新运行setup-server.sh
```

## 📞 获取帮助

如果遇到问题，请：

1. 检查 `docs/environment-variables-setup.md` 详细文档
2. 查看 `docs/deployment-optimizations.md` 部署优化指南
3. 检查服务器日志：`ssh user@server "docker compose logs"`

## ✅ 部署检查清单

- [ ] SSH密钥已生成并配置到服务器
- [ ] SSL证书已准备就绪
- [ ] 所有密码和密钥已生成（不要使用默认值）
- [ ] 域名DNS已正确配置
- [ ] 服务器防火墙已开放必要端口（22, 80, 443）
- [ ] Docker镜像加速已配置
- [ ] 环境变量文件已创建并配置

完成这些步骤后，你的 Annie 网站就可以成功部署了！🎉
