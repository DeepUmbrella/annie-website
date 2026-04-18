#!/bin/bash
# Annie 网站环境变量生成和配置脚本
# 使用方法: ./scripts/setup-env.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log_error "$1 命令未找到，请先安装"
        exit 1
    fi
}

# 生成随机密钥
generate_secret() {
    local length=${1:-32}
    openssl rand -hex "$length"
}

# 生成密码
generate_password() {
    local length=${1:-16}
    openssl rand -hex "$length"
}

# 创建SSH密钥
setup_ssh_key() {
    local key_path="$HOME/.ssh/annie-deploy"

    if [ -f "$key_path" ]; then
        log_warn "SSH密钥已存在: $key_path"
        read -p "是否要重新生成? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi

    log_step "生成SSH密钥对..."
    ssh-keygen -t ed25519 -C "annie-deploy@$(hostname)" -f "$key_path" -N ""

    log_info "SSH密钥已生成:"
    log_info "私钥: $key_path"
    log_info "公钥: ${key_path}.pub"
    log_info "请手动将公钥内容添加到服务器的 ~/.ssh/authorized_keys 文件中"
    echo
    log_info "公钥内容:"
    cat "${key_path}.pub"
    echo

    # 设置正确的权限
    chmod 600 "$key_path"
    chmod 644 "${key_path}.pub"
}

# 生成环境变量文件
generate_env_files() {
    log_step "生成安全密钥..."

    local jwt_secret=$(generate_secret 32)
    local db_password=$(generate_password 16)
    local meili_key=$(generate_secret 32)

    log_info "已生成安全密钥"

    # 创建主环境变量文件
    cat > "$PROJECT_ROOT/.env" << EOF
# Annie 网站环境变量配置
# 生成时间: $(date)
# 请根据实际情况修改服务器相关配置

# 服务器配置
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://your-domain.com

# 数据库配置
POSTGRES_USER=annie
POSTGRES_PASSWORD=${db_password}
POSTGRES_DB=annie_db
DATABASE_URL=postgresql://annie:${db_password}@postgres:5432/annie_db?schema=public

# Redis 配置
REDIS_URL=redis://redis:6379

# MeiliSearch 配置
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=${meili_key}
MEILI_MASTER_KEY=${meili_key}

# JWT 配置
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d

# Annie AI 服务 (请根据实际情况配置)
ANNIE_API_URL=https://annie-api.your-domain.com
ANNIE_API_KEY=your-annie-api-key
EOF

    # 创建后端专用环境变量文件
    cat > "$PROJECT_ROOT/backend/.env" << EOF
# Annie 后端环境变量配置
# 生成时间: $(date)

NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://annie:${db_password}@postgres:5432/annie_db?schema=public
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=${meili_key}
MEILI_MASTER_KEY=${meili_key}
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
EOF

    # 创建部署环境变量文件
    cat > "$PROJECT_ROOT/deploy.env" << EOF
# Annie 部署环境变量
# 生成时间: $(date)
# 请修改以下配置为你的实际值

# 服务器连接配置
SSH_HOST=your-server-ip-or-domain
SSH_USER=ubuntu
SSH_KEY=${HOME}/.ssh/annie-deploy
DOMAIN=your-domain.com

# 数据库和安全配置
POSTGRES_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
MEILISEARCH_MASTER_KEY=${meili_key}

# Docker 镜像加速
DOCKER_REGISTRY_MIRROR=https://your-registry-mirror.com

# SSL 证书路径 (使用 Let's Encrypt 或其他证书)
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
EOF

    # 创建密钥备份文件（仅本地使用，不要提交到Git）
    cat > "$PROJECT_ROOT/secrets.env" << EOF
# 安全密钥备份文件
# 生成时间: $(date)
# ⚠️  此文件包含敏感信息，请妥善保管，不要提交到版本控制系统

JWT_SECRET=${jwt_secret}
POSTGRES_PASSWORD=${db_password}
MEILISEARCH_MASTER_KEY=${meili_key}
EOF

    log_info "环境变量文件已生成:"
    log_info "- $PROJECT_ROOT/.env (主环境变量)"
    log_info "- $PROJECT_ROOT/backend/.env (后端专用)"
    log_info "- $PROJECT_ROOT/deploy.env (部署配置)"
    log_info "- $PROJECT_ROOT/secrets.env (密钥备份，请妥善保管)"
}

# 配置git忽略敏感文件
setup_gitignore() {
    local gitignore="$PROJECT_ROOT/.gitignore"

    if [ ! -f "$gitignore" ]; then
        log_warn ".gitignore 文件不存在，跳过配置"
        return 0
    fi

    local sensitive_files=(
        ".env"
        "backend/.env"
        "deploy.env"
        "secrets.env"
        "*.key"
        "*.pem"
    )

    local added=false
    for file in "${sensitive_files[@]}"; do
        if ! grep -q "^${file}$" "$gitignore"; then
            echo "$file" >> "$gitignore"
            added=true
        fi
    done

    if [ "$added" = true ]; then
        log_info "已将敏感文件添加到 .gitignore"
    fi
}

# 主函数
main() {
    log_info "Annie 网站环境变量配置工具"
    echo

    # 检查必要命令
    check_command openssl
    check_command ssh-keygen

    # 步骤1: 生成SSH密钥
    setup_ssh_key

    # 步骤2: 生成环境变量文件
    generate_env_files

    # 步骤3: 配置gitignore
    setup_gitignore

    echo
    log_info "✅ 环境变量配置完成！"
    echo
    log_warn "重要提醒:"
    log_warn "1. 请编辑 deploy.env 文件，填入你的服务器信息"
    log_warn "2. 请将SSH公钥添加到服务器的 ~/.ssh/authorized_keys"
    log_warn "3. 请配置SSL证书或使用Let's Encrypt"
    log_warn "4. secrets.env文件包含敏感信息，请妥善保管，不要提交到Git"
    echo
    log_info "接下来运行:"
    log_info "  env \$(cat deploy.env | xargs) ./scripts/setup-server.sh"
    log_info "  env \$(cat deploy.env | xargs) ./scripts/deploy-app.sh"
}

# 检查是否直接运行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
