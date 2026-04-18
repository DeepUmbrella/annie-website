#!/bin/bash
# Annie 应用部署脚本
# 前提：服务器已完成 scripts/setup-server.sh

set -euo pipefail

: "${SSH_HOST:?Need SSH_HOST}"
: "${SSH_USER:?Need SSH_USER}"
: "${SSH_KEY:?Need SSH_KEY}"
: "${POSTGRES_PASSWORD:?Need POSTGRES_PASSWORD}"
: "${JWT_SECRET:?Need JWT_SECRET}"
: "${MEILISEARCH_MASTER_KEY:?Need MEILISEARCH_MASTER_KEY}"
: "${DOMAIN:?Need DOMAIN}"

SSH_TARGET="${SSH_USER}@${SSH_HOST}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30)
REMOTE_SUDO="sudo"
if [ "$SSH_USER" = "root" ]; then
    REMOTE_SUDO=""
fi
REPO_URL="${REPO_URL:-https://github.com/DeepUmbrella/annie-website.git}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
REMOTE_DIR="${REMOTE_DIR:-/root/annie-website}"
COMPOSE_CMD="${COMPOSE_CMD:-docker compose}"
DATABASE_URL="postgresql://annie:${POSTGRES_PASSWORD}@postgres:5432/annie_db?schema=public"
NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmmirror.com}"
if [[ "$DOMAIN" == www.* ]]; then
    API_BASE_DOMAIN="${DOMAIN#www.}"
else
    API_BASE_DOMAIN="${DOMAIN}"
fi
ANNIE_API_URL="${ANNIE_API_URL:-https://annie-api.${API_BASE_DOMAIN}}"
ANNIE_API_KEY="${ANNIE_API_KEY:-your-annie-api-key}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "$TMP_ROOT_ENV" "$TMP_BACKEND_ENV"
}

trap cleanup EXIT

TMP_ROOT_ENV="$(mktemp)"
TMP_BACKEND_ENV="$(mktemp)"

# Health check function
check_service_health() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    log_info "Checking $service_name health at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f --max-time 10 "$url" >/dev/null 2>&1; then
            log_info "$service_name is healthy"
            return 0
        fi

        log_warn "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done

    log_error "$service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Backup function (optional)
create_backup() {
    log_info "Creating backup of current deployment..."
    ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        if [ -d $REMOTE_DIR ]; then
            BACKUP_DIR=\"$REMOTE_DIR.backup.$(date +%Y%m%d_%H%M%S)\"
            cp -r $REMOTE_DIR \"\$BACKUP_DIR\"
            echo \"Backup created at \$BACKUP_DIR\"
        fi
    "
}

# Rollback function
rollback() {
    log_error "Deployment failed, attempting rollback..."
    ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        if docker compose version >/dev/null 2>&1; then
            COMPOSE_BIN='docker compose'
        elif command -v docker-compose >/dev/null 2>&1; then
            COMPOSE_BIN='docker-compose'
        else
            echo 'No docker compose command found for rollback'
            exit 1
        fi
        if ls -d $REMOTE_DIR.backup.* >/dev/null 2>&1; then
            LATEST_BACKUP=\$(ls -td $REMOTE_DIR.backup.* | head -1)
            if [ -d \"\$LATEST_BACKUP\" ]; then
                rm -rf $REMOTE_DIR
                mv \"\$LATEST_BACKUP\" $REMOTE_DIR
                cd $REMOTE_DIR
                \$COMPOSE_BIN up -d
                echo 'Rollback completed'
            fi
        else
            echo 'No backup found for rollback'
        fi
    "
}

# Main deployment
main() {
    log_info "Starting deployment to $SSH_TARGET..."

    # Create backup
    create_backup

    cat >"$TMP_ROOT_ENV" <<EOF
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://${DOMAIN}
POSTGRES_USER=annie
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=annie_db
DATABASE_URL=${DATABASE_URL}
NPM_REGISTRY=${NPM_REGISTRY}
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ANNIE_API_URL=${ANNIE_API_URL}
ANNIE_API_KEY=${ANNIE_API_KEY}
EOF

    cat >"$TMP_BACKEND_ENV" <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL}
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://${DOMAIN}
EOF

    log_info "1) 获取项目代码"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        if [ -d $REMOTE_DIR/.git ]; then
            cd $REMOTE_DIR
            git remote set-url origin $REPO_URL 2>/dev/null || git remote add origin $REPO_URL
            git fetch origin
            git checkout $DEPLOY_BRANCH 2>/dev/null || git checkout -B $DEPLOY_BRANCH origin/$DEPLOY_BRANCH
            git pull --rebase origin $DEPLOY_BRANCH
        else
            rm -rf $REMOTE_DIR && git clone --branch $DEPLOY_BRANCH $REPO_URL $REMOTE_DIR
        fi
    "; then
        log_error "Failed to update code"
        rollback
        exit 1
    fi

    log_info "2) 上传环境变量文件"
    if ! scp "${SSH_OPTS[@]}" "$TMP_ROOT_ENV" "$SSH_TARGET:/tmp/annie-root.env" ||
       ! scp "${SSH_OPTS[@]}" "$TMP_BACKEND_ENV" "$SSH_TARGET:/tmp/annie-backend.env" ||
       ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
           ${REMOTE_SUDO} mv /tmp/annie-root.env $REMOTE_DIR/.env &&
           ${REMOTE_SUDO} mv /tmp/annie-backend.env $REMOTE_DIR/backend/.env &&
           ${REMOTE_SUDO} chmod 600 $REMOTE_DIR/.env $REMOTE_DIR/backend/.env
       "; then
        log_error "Failed to upload environment files"
        rollback
        exit 1
    fi

    log_info "3) 检查 Docker 镜像加速并启动服务"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        set -e
        if docker compose version >/dev/null 2>&1; then
            COMPOSE_BIN='docker compose'
        elif command -v docker-compose >/dev/null 2>&1; then
            COMPOSE_BIN='docker-compose'
        else
            echo 'No docker compose command found'
            exit 1
        fi
        MIRRORS=\$(docker info --format '{{json .RegistryConfig.Mirrors}}' 2>/dev/null || echo '[]')
        if [ \"\$MIRRORS\" = '[]' ] || [ -z \"\$MIRRORS\" ]; then
            echo 'Docker 镜像加速未生效，请先重新执行 setup-server.sh 并确认 docker 已重启。'
            exit 1
        fi

        # Pull images in parallel
        for IMG in 'postgres:15' 'redis:7' 'getmeili/meilisearch:v1.3'; do
            docker pull \"\$IMG\" &
        done
        wait

        cd $REMOTE_DIR
        \$COMPOSE_BIN up -d --build
    "; then
        log_error "Failed to start services"
        rollback
        exit 1
    fi

    log_info "4) 初始化数据库"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        cd $REMOTE_DIR
        if docker compose version >/dev/null 2>&1; then
            COMPOSE_BIN='docker compose'
        elif command -v docker-compose >/dev/null 2>&1; then
            COMPOSE_BIN='docker-compose'
        else
            echo 'No docker compose command found'
            exit 1
        fi
        \$COMPOSE_BIN exec -T backend sh -lc 'npx prisma generate && npx prisma migrate deploy'
    "; then
        log_error "Failed to initialize database"
        rollback
        exit 1
    fi

    log_info "5) 检查服务状态"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        cd $REMOTE_DIR
        if docker compose version >/dev/null 2>&1; then
            COMPOSE_BIN='docker compose'
        elif command -v docker-compose >/dev/null 2>&1; then
            COMPOSE_BIN='docker-compose'
        else
            echo 'No docker compose command found'
            exit 1
        fi
        echo '=== Container Status ==='
        \$COMPOSE_BIN ps
        echo
        echo '=== Service Logs ==='
        \$COMPOSE_BIN logs --tail=20 backend
    "; then
        log_error "Failed to check service status"
        exit 1
    fi

    log_info "6) 验证服务健康状态"
    # Wait a bit for services to fully start
    sleep 30

    # Check backend health
    if ! check_service_health "Backend" "http://$SSH_HOST:${BACKEND_PORT:-3001}/health"; then
        log_error "Backend health check failed"
        exit 1
    fi

    # Check frontend health
    if ! check_service_health "Frontend" "http://$SSH_HOST/health"; then
        log_error "Frontend health check failed"
        exit 1
    fi

    log_info "✅ 部署完成并验证通过"
    log_info "应用访问地址: https://$DOMAIN"
    log_info "API地址: https://$DOMAIN/api"
}

main "$@"
