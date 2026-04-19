#!/bin/bash
# Annie Nginx 与 SSL 设置脚本（Ubuntu 22.04）
# 在服务器基础环境设置完成后执行，安装 Nginx、上传证书并生成站点配置

set -euo pipefail

: "${SSH_HOST:?Need SSH_HOST}"
: "${SSH_USER:?Need SSH_USER}"
: "${SSH_KEY:?Need SSH_KEY}"
: "${DOMAIN:?Need DOMAIN}"
: "${SSL_CERT_PATH:?Need SSL_CERT_PATH}"
: "${SSL_KEY_PATH:?Need SSL_KEY_PATH}"

SSH_TARGET="${SSH_USER}@${SSH_HOST}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=30)
REMOTE_SUDO="sudo"
if [ "$SSH_USER" = "root" ]; then
    REMOTE_SUDO=""
fi

PRIMARY_DOMAIN="${DOMAIN}"
if [[ "$DOMAIN" == www.* ]]; then
    ROOT_DOMAIN="${DOMAIN#www.}"
    SERVER_NAMES="${DOMAIN} ${ROOT_DOMAIN}"
else
    ROOT_DOMAIN="${DOMAIN}"
    SERVER_NAMES="${DOMAIN} www.${DOMAIN}"
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "$TMP_NGINX_CONF"
}

trap cleanup EXIT

TMP_NGINX_CONF="$(mktemp)"

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

main() {
    log_info "Starting Nginx setup for $SSH_TARGET..."

    cat >"$TMP_NGINX_CONF" <<EOF
server {
  listen 80 default_server;
  server_name ${SERVER_NAMES};

  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }

  location / {
    return 301 https://\$host\$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name ${SERVER_NAMES};

  ssl_certificate /etc/nginx/ssl/${PRIMARY_DOMAIN}.crt;
  ssl_certificate_key /etc/nginx/ssl/${PRIMARY_DOMAIN}.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
  ssl_prefer_server_ciphers off;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  add_header X-Frame-Options DENY;
  add_header X-Content-Type-Options nosniff;
  add_header X-XSS-Protection "1; mode=block";
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

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

  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
EOF

    log_info "1) 安装并启动 Nginx"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        set -e
        ${REMOTE_SUDO} apt update
        if ! command -v nginx >/dev/null 2>&1; then
            echo "Installing Nginx..."
            ${REMOTE_SUDO} apt install -y nginx
        fi
        ${REMOTE_SUDO} rm -f /etc/nginx/sites-enabled/default
        ${REMOTE_SUDO} systemctl enable nginx
        ${REMOTE_SUDO} systemctl restart nginx
        echo \"Nginx version: \$(nginx -v 2>&1)\"
    "; then
        log_error "Failed to install or start Nginx"
        exit 1
    fi

    if ! check_service_status "nginx"; then
        exit 1
    fi

    log_info "2) 上传 SSL 证书"
    if ! scp "${SSH_OPTS[@]}" "$SSL_CERT_PATH" "$SSH_TARGET:/tmp/${PRIMARY_DOMAIN}.pem" ||
       ! scp "${SSH_OPTS[@]}" "$SSL_KEY_PATH" "$SSH_TARGET:/tmp/${PRIMARY_DOMAIN}.key" ||
       ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
           ${REMOTE_SUDO} mkdir -p /etc/nginx/ssl
           ${REMOTE_SUDO} mv /tmp/${PRIMARY_DOMAIN}.pem /etc/nginx/ssl/${PRIMARY_DOMAIN}.crt
           ${REMOTE_SUDO} mv /tmp/${PRIMARY_DOMAIN}.key /etc/nginx/ssl/${PRIMARY_DOMAIN}.key
           ${REMOTE_SUDO} chmod 644 /etc/nginx/ssl/${PRIMARY_DOMAIN}.crt
           ${REMOTE_SUDO} chmod 600 /etc/nginx/ssl/${PRIMARY_DOMAIN}.key
       "; then
        log_error "Failed to upload SSL certificates"
        exit 1
    fi

    log_info "3) 配置 Nginx 站点"
    if ! scp "${SSH_OPTS[@]}" "$TMP_NGINX_CONF" "$SSH_TARGET:/tmp/annie-website.conf" ||
       ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
           ${REMOTE_SUDO} mv /tmp/annie-website.conf /etc/nginx/conf.d/annie-website.conf
           ${REMOTE_SUDO} nginx -t
           ${REMOTE_SUDO} systemctl reload nginx
       "; then
        log_error "Failed to configure Nginx site"
        exit 1
    fi

    log_info "4) 最终验证"
    if ! ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "
        echo '=== Nginx Status ==='
        ${REMOTE_SUDO} systemctl status nginx --no-pager -l
        echo
        echo '=== Nginx Config Test ==='
        ${REMOTE_SUDO} nginx -t
        echo
        echo '=== Nginx Site Config ==='
        ${REMOTE_SUDO} sed -n '1,220p' /etc/nginx/conf.d/annie-website.conf
    "; then
        log_error "Final verification failed"
        exit 1
    fi

    log_info "✅ Nginx 与 SSL 设置完成"
}

main "$@"
