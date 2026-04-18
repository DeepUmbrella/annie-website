#!/bin/bash
# Annie 服务器首次环境设置脚本（Ubuntu 22.04）
# 首次部署前执行一次，安装 Docker / Docker Compose / Nginx，配置 Docker 镜像加速和 SSL

set -euo pipefail

: "${SSH_HOST:?Need SSH_HOST}"
: "${SSH_USER:?Need SSH_USER}"
: "${SSH_KEY:?Need SSH_KEY}"
: "${ALIYUN_MIRROR:?Need ALIYUN_MIRROR}"
: "${DOMAIN:?Need DOMAIN}"
: "${SSL_CERT_PATH:?Need SSL_CERT_PATH}"
: "${SSL_KEY_PATH:?Need SSL_KEY_PATH}"

SSH_TARGET="${SSH_USER}@${SSH_HOST}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30)

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
    rm -f "$TMP_NGINX_CONF"
}

trap cleanup EXIT

TMP_NGINX_CONF="$(mktemp)"

# Health check function
check_service_status() {
    local service_name=$1
    local max_attempts=10
    local attempt=1

    log_info "Checking $service_name status..."

    while [ $attempt -le $max_attempts ]; do
        if ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo systemctl is-active --quiet $service_name"; then
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

# Security hardening function
harden_server() {
    log_info "Applying basic security hardening..."
    ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        # Disable root login via SSH
        sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
        sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

        # Disable password authentication
        sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

        # Configure firewall (allow SSH, HTTP, HTTPS)
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw --force reload

        # Install fail2ban for SSH protection
        sudo apt update && sudo apt install -y fail2ban
        sudo systemctl enable fail2ban
        sudo systemctl start fail2ban

        # Restart SSH service
        sudo systemctl reload ssh
    "
}

# Main setup
main() {
    log_info "Starting server setup for $SSH_TARGET..."

    cat >"$TMP_NGINX_CONF" <<EOF
server {
  listen 80;
  server_name ${DOMAIN} www.${DOMAIN};
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name ${DOMAIN} www.${DOMAIN};

  ssl_certificate /etc/nginx/ssl/${DOMAIN}.crt;
  ssl_certificate_key /etc/nginx/ssl/${DOMAIN}.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
  ssl_prefer_server_ciphers off;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  # Security headers
  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
  add_header X-XSS-Protection "1; mode=block";
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 86400;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 86400;
  }

  # Health check endpoint
  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
EOF

    log_info "1) 安装基础环境（Git / Docker / Nginx）"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" '
        set -e

        # Update package list
        sudo apt update

        # Install Git if not present
        if ! command -v git >/dev/null 2>&1; then
            log_info "Installing Git..."
            sudo apt install -y git
        fi

        # Install Docker if not present
        if ! command -v docker >/dev/null 2>&1; then
            log_info "Installing Docker..."
            sudo apt install -y ca-certificates curl gnupg lsb-release
            sudo install -m 0755 -d /etc/apt/keyrings

            if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            fi

            sudo chmod a+r /etc/apt/keyrings/docker.gpg

            if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                sudo apt update
            fi

            sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        fi

        # Verify Docker installation
        if ! command -v docker >/dev/null 2>&1; then
            echo "Docker installation failed"
            exit 1
        fi

        # Install Nginx if not present
        if ! command -v nginx >/dev/null 2>&1; then
            log_info "Installing Nginx..."
            sudo apt install -y nginx
        fi

        # Enable and start services
        sudo systemctl enable docker
        sudo systemctl enable nginx

        # Print versions
        echo "Git version: $(git --version)"
        echo "Docker version: $(docker --version)"
        echo "Docker Compose version: $(docker compose version)"
        echo "Nginx version: $(nginx -v 2>&1)"
    '; then
        log_error "Failed to install base environment"
        exit 1
    fi

    log_info "2) 配置 Docker 镜像加速"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        sudo mkdir -p /etc/docker
        sudo tee /etc/docker/daemon.json >/dev/null <<EOF
{
  \"registry-mirrors\": [\"${ALIYUN_MIRROR}\"],
  \"log-driver\": \"json-file\",
  \"log-opts\": {
    \"max-size\": \"10m\",
    \"max-file\": \"3\"
  }
}
EOF
        sudo systemctl daemon-reload
        sudo systemctl restart docker
    "; then
        log_error "Failed to configure Docker mirror"
        exit 1
    fi

    # Check Docker status
    if ! check_service_status "docker"; then
        exit 1
    fi

    log_info "3) 启动 Nginx"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'sudo systemctl restart nginx'; then
        log_error "Failed to start Nginx"
        exit 1
    fi

    # Check Nginx status
    if ! check_service_status "nginx"; then
        exit 1
    fi

    log_info "4) 上传 SSL 证书"
    if ! scp "${SSH_OPTS[@]}" "$SSL_CERT_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.pem" ||
       ! scp "${SSH_OPTS[@]}" "$SSL_KEY_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.key" ||
       ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
           sudo mkdir -p /etc/nginx/ssl
           sudo mv /tmp/${DOMAIN}.pem /etc/nginx/ssl/${DOMAIN}.crt
           sudo mv /tmp/${DOMAIN}.key /etc/nginx/ssl/${DOMAIN}.key
           sudo chmod 644 /etc/nginx/ssl/${DOMAIN}.crt
           sudo chmod 600 /etc/nginx/ssl/${DOMAIN}.key
       "; then
        log_error "Failed to upload SSL certificates"
        exit 1
    fi

    log_info "5) 配置 Nginx 站点"
    if ! scp "${SSH_OPTS[@]}" "$TMP_NGINX_CONF" "$SSH_TARGET:/tmp/annie-website.conf" ||
       ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" '
           sudo mv /tmp/annie-website.conf /etc/nginx/conf.d/annie-website.conf
           sudo nginx -t
           sudo systemctl reload nginx
       '; then
        log_error "Failed to configure Nginx site"
        exit 1
    fi

    log_info "6) 应用安全加固"
    harden_server

    log_info "7) 最终验证"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        echo '=== Service Status ==='
        sudo systemctl status docker --no-pager -l
        sudo systemctl status nginx --no-pager -l
        sudo systemctl status fail2ban --no-pager -l
        echo
        echo '=== Docker Info ==='
        docker info --format 'Mirrors: {{json .RegistryConfig.Mirrors}}'
        echo
        echo '=== Nginx Config Test ==='
        sudo nginx -t
        echo
        echo '=== Firewall Status ==='
        sudo ufw status
    "; then
        log_error "Final verification failed"
        exit 1
    fi

    log_info "✅ 服务器设置完成"
    log_info "服务器已准备好进行应用部署"
}

main "$@"
