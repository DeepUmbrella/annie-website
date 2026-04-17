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
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no)

TMP_NGINX_CONF="$(mktemp)"
trap 'rm -f "$TMP_NGINX_CONF"' EXIT

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
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

echo "==> 1) 安装基础环境（Git / Docker / Nginx）"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'set -e
sudo apt update

if ! command -v git >/dev/null 2>&1; then
  sudo apt install -y git
fi

if ! command -v docker >/dev/null 2>&1; then
  sudo apt install -y ca-certificates curl gnupg lsb-release
  sudo install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  fi
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
  fi
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker 安装失败，请手动检查仓库和网络。"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  sudo apt install -y nginx
fi

sudo systemctl enable docker
sudo systemctl enable nginx

git --version
docker --version
docker compose version
nginx -v'

echo "==> 2) 配置 Docker 镜像加速"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo mkdir -p /etc/docker && sudo tee /etc/docker/daemon.json >/dev/null <<'EOF'
{
  \"registry-mirrors\": [\"${ALIYUN_MIRROR}\"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker"

echo "==> 3) 启动 Nginx"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'sudo systemctl restart nginx'

echo "==> 4) 上传 SSL 证书"
scp "${SSH_OPTS[@]}" "$SSL_CERT_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.pem"
scp "${SSH_OPTS[@]}" "$SSL_KEY_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.key"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo mkdir -p /etc/nginx/ssl && sudo mv /tmp/${DOMAIN}.pem /etc/nginx/ssl/${DOMAIN}.crt && sudo mv /tmp/${DOMAIN}.key /etc/nginx/ssl/${DOMAIN}.key && sudo chmod 644 /etc/nginx/ssl/${DOMAIN}.crt && sudo chmod 600 /etc/nginx/ssl/${DOMAIN}.key"

echo "==> 5) 配置 Nginx 站点"
scp "${SSH_OPTS[@]}" "$TMP_NGINX_CONF" "$SSH_TARGET:/tmp/annie-website.conf"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'sudo mv /tmp/annie-website.conf /etc/nginx/conf.d/annie-website.conf && sudo nginx -t && sudo systemctl reload nginx'

echo "✅ setup 完成"
