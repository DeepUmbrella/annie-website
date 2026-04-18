# Annie 部署快速开始

这份文档面向第一次部署项目的同事，目标是回答三个问题：

- 部署前要准备什么
- 推荐按什么顺序执行
- 出问题时先看哪里

如果你只想快速完成一次标准部署，优先走下面的“推荐路径”。

## 部署前提

开始之前，请先准备好这些信息和资源：

- 一台可 SSH 登录的 Linux 服务器
- 已解析到服务器的域名
- SSL 证书和私钥文件
- 本地可用的 `ssh`、`openssl`、`ssh-keygen`

部署脚本分为两类：

- `scripts/setup-server.sh`
-  作用：首次初始化服务器基础环境，安装 Git / Docker / Docker Compose，配置镜像加速并进行基础安全加固
- `scripts/setup-nginx.sh`
  作用：安装 Nginx、上传 SSL 证书并生成站点配置
- `scripts/deploy-app.sh`
  作用：拉取代码、上传环境变量、启动容器、执行 Prisma 迁移、做健康检查

## 推荐路径

### 1. 自动生成部署文件

在项目根目录运行：

```bash
./scripts/setup-env.sh
```

这个脚本会自动完成这些事情：

- 生成 `~/.ssh/annie-deploy` SSH 密钥对
- 生成随机的数据库密码、JWT 密钥、MeiliSearch 密钥
- 创建 `.env`、`backend/.env`、`deploy.env`、`secrets.env`
- 把常见敏感文件加入 `.gitignore`

生成后请重点关注这几个文件：

- `.env`
  生产环境 Docker Compose 使用的根环境变量
- `backend/.env`
  后端进程使用的环境变量
- `deploy.env`
  部署脚本执行时依赖的变量
- `secrets.env`
  本地密钥备份，不要提交到 Git

### 2. 编辑 `deploy.env`

至少需要把这些字段替换成真实值：

```bash
SSH_HOST=your-server-ip-or-domain
SSH_USER=ubuntu
SSH_KEY=~/.ssh/annie-deploy
DOMAIN=your-domain.com
DOCKER_REGISTRY_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/path/to/fullchain.pem
SSL_KEY_PATH=/path/to/privkey.pem
```

说明：

- `SSH_HOST` 是服务器 IP 或域名
- `SSH_USER` 是服务器登录用户，推荐使用具备 `sudo` 权限的非 `root` 用户
- `SSH_KEY` 默认可以使用脚本生成的 `~/.ssh/annie-deploy`
- `DOCKER_REGISTRY_MIRROR` 是 Docker 镜像加速地址，`setup-server.sh` 会强制要求这个值
- `SSL_CERT_PATH` 和 `SSL_KEY_PATH` 是你本地机器上的证书文件路径，脚本会把它们上传到服务器

### 3. 把 SSH 公钥加到服务器

推荐方式：

```bash
ssh-copy-id -i ~/.ssh/annie-deploy.pub user@your-server-ip
```

或者手动追加到服务器的 `~/.ssh/authorized_keys`。

### 4. 首次初始化服务器基础环境

这一步只需要执行一次：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
```

这一步会做的事情包括：

- 安装 Git、Docker、Docker Compose
- 配置 Docker 镜像加速
- 做基础安全加固

### 5. 配置 Nginx 和 SSL

这一步通常也是首次部署时执行一次：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-nginx.sh
```

这一步会做的事情包括：

- 安装并启动 Nginx
- 上传 SSL 证书
- 生成并启用宿主机 Nginx 配置

### 6. 部署应用

```bash
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

这一步会自动：

- 从 GitHub 拉取或更新代码
- 生成并上传服务器端 `.env` 和 `backend/.env`
- 启动 Docker Compose 服务
- 执行 `prisma generate` 和 `prisma migrate deploy`
- 检查后端和前端健康状态

部署成功后，默认访问地址是：

- 站点首页：`https://your-domain.com`
- API：`https://your-domain.com/api`

## GitHub Actions 自动部署

如果你希望在代码推送到 `main` 分支后自动部署，项目里已经提供了工作流文件：

- [`.github/workflows/deploy.yml`](/Users/yanlin/projects/annie-website/.github/workflows/deploy.yml)

这个工作流会在以下场景触发：

- push 到 `main`
- 手动点击 `Run workflow`

### 需要配置的 GitHub Secrets

在仓库的 `Settings > Secrets and variables > Actions` 中添加：

```bash
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
DOMAIN
POSTGRES_PASSWORD
JWT_SECRET
MEILISEARCH_MASTER_KEY
```

说明：

- `SSH_PRIVATE_KEY` 填部署服务器对应的私钥内容
- 工作流会把当前仓库的 `main` 分支部署到服务器
- 自动部署默认调用 `scripts/deploy-app.sh`
- 服务器首次初始化仍然要先手动执行一次 `scripts/setup-server.sh` 和 `scripts/setup-nginx.sh`

### 自动部署前的前提

至少先确认这些项：

- 服务器已经完成首次初始化
- 域名和 Nginx 已配置完成
- 服务器能够访问 GitHub 仓库
- `scripts/deploy-app.sh` 当前指向的部署目录和仓库地址符合你的预期
- 首次初始化最好不要使用 `root` 作为长期部署用户；如果当前只能用 `root`，请在切换到非 root 用户后再禁用 root SSH 登录

## 手动路径

如果你不想使用 `setup-env.sh` 自动生成文件，也可以手动准备密钥和配置。

### 1. 生成安全密钥

```bash
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
MEILISEARCH_MASTER_KEY=$(openssl rand -hex 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "MEILISEARCH_MASTER_KEY=$MEILISEARCH_MASTER_KEY"
```

### 2. 创建根目录 `.env`

```bash
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://your-domain.com
POSTGRES_USER=annie
POSTGRES_PASSWORD=your-generated-password
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:your-generated-password@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-generated-key
MEILI_MASTER_KEY=your-generated-key
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=7d
ANNIE_API_URL=https://annie-api.your-domain.com
ANNIE_API_KEY=your-annie-api-key
```

说明：根目录 `.env` 主要给 Docker Compose 使用，`BACKEND_PORT` 是宿主机暴露端口。

### 3. 创建 `backend/.env`

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://annie:your-generated-password@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=your-generated-key
MEILI_MASTER_KEY=your-generated-key
JWT_SECRET=your-generated-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

说明：`PORT` 才是 Nest.js 进程真正监听的端口。

### 4. 创建 `deploy.env`

```bash
SSH_HOST=your-server-ip
SSH_USER=ubuntu
SSH_KEY=~/.ssh/annie-deploy
DOMAIN=your-domain.com
POSTGRES_PASSWORD=your-generated-password
JWT_SECRET=your-generated-secret
MEILISEARCH_MASTER_KEY=your-generated-key
DOCKER_REGISTRY_MIRROR=https://your-registry-mirror.com
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 5. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "annie-deploy@your-email.com" -f ~/.ssh/annie-deploy -N ""
chmod 600 ~/.ssh/annie-deploy
chmod 644 ~/.ssh/annie-deploy.pub
```

### 6. 执行部署

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
env $(cat deploy.env | xargs) ./scripts/setup-nginx.sh
env $(cat deploy.env | xargs) ./scripts/deploy-app.sh
```

## 最小检查清单

执行部署前，至少确认这些项：

- [ ] `deploy.env` 里的 `SSH_HOST`、`SSH_USER`、`DOMAIN` 已改成真实值
- [ ] `POSTGRES_PASSWORD`、`JWT_SECRET`、`MEILISEARCH_MASTER_KEY` 不是占位值
- [ ] SSH 公钥已经加入服务器
- [ ] 本地证书文件路径真实存在
- [ ] 域名已经解析到服务器

## 常见问题

### SSH 无法连接

先测试：

```bash
ssh -i ~/.ssh/annie-deploy user@your-server-ip
```

重点检查：

- 公钥是否已加入服务器
- 防火墙是否开放 22 端口
- SSH 服务是否正常运行

### SSL 证书路径不对

先检查证书文件是否存在：

```bash
ls -la /path/to/fullchain.pem /path/to/privkey.pem
```

如果你使用的是 Let's Encrypt，常见路径通常是：

```bash
/etc/letsencrypt/live/your-domain.com/fullchain.pem
/etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Docker 镜像拉取慢或失败

先确认镜像加速是否已生效：

```bash
docker info --format '{{json .RegistryConfig.Mirrors}}'
```

如果为空，重新执行：

```bash
env $(cat deploy.env | xargs) ./scripts/setup-server.sh
```

### 部署后服务没有起来

优先查看这些输出：

```bash
ssh user@server "cd /root/annie-website && docker compose ps"
ssh user@server "cd /root/annie-website && docker compose logs --tail=100 backend"
ssh user@server "cd /root/annie-website && docker compose logs --tail=100 frontend"
```

## 相关文档

- [README.md](/Users/yanlin/projects/annie-website/README.md)
- [docs/deployment.md](/Users/yanlin/projects/annie-website/docs/deployment.md)
- [docs/environment-variables-setup.md](/Users/yanlin/projects/annie-website/docs/environment-variables-setup.md)
- [docs/deployment-optimizations.md](/Users/yanlin/projects/annie-website/docs/deployment-optimizations.md)
