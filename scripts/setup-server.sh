#!/bin/bash
# Annie 服务器基础环境设置脚本（Ubuntu 22.04）
# 首次部署前执行一次，安装 Git / Docker / Docker Compose，配置 Docker 镜像加速

set -euo pipefail

: "${SSH_HOST:?Need SSH_HOST}"
: "${SSH_USER:?Need SSH_USER}"
: "${SSH_KEY:?Need SSH_KEY}"

DOCKER_REGISTRY_MIRROR="${DOCKER_REGISTRY_MIRROR:-${ALIYUN_MIRROR:-}}"
: "${DOCKER_REGISTRY_MIRROR:?Need DOCKER_REGISTRY_MIRROR}"

SSH_TARGET="${SSH_USER}@${SSH_HOST}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30)
REMOTE_SUDO="sudo"
if [ "$SSH_USER" = "root" ]; then
    REMOTE_SUDO=""
fi

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

# Health check function
check_service_status() {
    local service_name=$1
    local max_attempts=10
    local attempt=1

    log_info "Checking $service_name status..."

    while [ $attempt -le $max_attempts ]; do
        if ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "${REMOTE_SUDO} systemctl is-active --quiet $service_name"; then
            log_info "$service_name is running"
            return 0
        fi

        log_warn "Attempt $attempt/$max_attempts: $service_name not ready yet, waiting..."
        sleep 5
        ((attempt++))
    done

    log_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Main setup
main() {
    log_info "Starting server setup for $SSH_TARGET..."

    log_info "1) 安装基础环境（Git / Docker）"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        set -e

        # Update package list
        ${REMOTE_SUDO} apt-get update

        # Install Git if not present
        if ! command -v git >/dev/null 2>&1; then
            echo "Installing Git..."
            ${REMOTE_SUDO} apt-get install -y git
        fi

        # Install Docker if not present
        if ! command -v docker >/dev/null 2>&1; then
            echo "Installing Docker..."
            ${REMOTE_SUDO} apt-get install -y ca-certificates curl gnupg lsb-release
            ${REMOTE_SUDO} install -m 0755 -d /etc/apt/keyrings

            docker_repo_ready=false
            if curl -fsSL --connect-timeout 10 --retry 2 https://download.docker.com/linux/ubuntu/gpg | ${REMOTE_SUDO} gpg --dearmor -o /etc/apt/keyrings/docker.gpg; then
                ${REMOTE_SUDO} chmod a+r /etc/apt/keyrings/docker.gpg
                echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo \\\"\$VERSION_CODENAME\\\") stable\" | ${REMOTE_SUDO} tee /etc/apt/sources.list.d/docker.list > /dev/null
                if ${REMOTE_SUDO} apt-get update; then
                    docker_repo_ready=true
                fi
            fi

            if [ \"\$docker_repo_ready\" = true ]; then
                ${REMOTE_SUDO} apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            else
                echo \"Docker official repo is unreachable, falling back to Ubuntu packages...\"
                ${REMOTE_SUDO} rm -f /etc/apt/sources.list.d/docker.list /etc/apt/keyrings/docker.gpg
                ${REMOTE_SUDO} apt-get update
                ${REMOTE_SUDO} apt-get install -y docker.io docker-compose
            fi
        fi

        # Verify Docker installation
        if ! command -v docker >/dev/null 2>&1; then
            echo "Docker installation failed"
            exit 1
        fi

        # Enable and start services
        ${REMOTE_SUDO} systemctl enable docker
        ${REMOTE_SUDO} systemctl restart docker

        # Print versions
        echo \"Git version: \$(git --version)\"
        echo \"Docker version: \$(docker --version)\"
        if docker compose version >/dev/null 2>&1; then
            echo \"Docker Compose version: \$(docker compose version)\"
        elif command -v docker-compose >/dev/null 2>&1; then
            echo \"Docker Compose version: \$(docker-compose --version)\"
        else
            echo \"Docker Compose is not available\"
            exit 1
        fi
    "; then
        log_error "Failed to install base environment"
        exit 1
    fi

    log_info "2) 配置 Docker 镜像加速"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        ${REMOTE_SUDO} mkdir -p /etc/docker
        ${REMOTE_SUDO} tee /etc/docker/daemon.json >/dev/null <<EOF
{
  \"registry-mirrors\": [\"${DOCKER_REGISTRY_MIRROR}\"],
  \"log-driver\": \"json-file\",
  \"log-opts\": {
    \"max-size\": \"10m\",
    \"max-file\": \"3\"
  }
}
EOF
        ${REMOTE_SUDO} systemctl daemon-reload
        ${REMOTE_SUDO} systemctl restart docker
    "; then
        log_error "Failed to configure Docker mirror"
        exit 1
    fi

    # Check Docker status
    if ! check_service_status "docker"; then
        exit 1
    fi

    log_info "3) 最终验证"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        echo '=== Service Status ==='
        ${REMOTE_SUDO} systemctl status docker --no-pager -l
        if docker compose version >/dev/null 2>&1; then
            echo 'docker compose is available'
        else
            docker-compose --version
        fi
        echo
        echo '=== Docker Info ==='
        docker info --format 'Mirrors: {{json .RegistryConfig.Mirrors}}'
    "; then
        log_error "Final verification failed"
        exit 1
    fi

    log_info "✅ 服务器基础环境设置完成"
    log_info "下一步请执行 scripts/setup-nginx.sh，然后再执行应用部署"
}

main "$@"
