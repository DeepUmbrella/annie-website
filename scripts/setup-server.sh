#!/bin/bash
# Annie 服务器首次环境设置脚本
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

echo "==> 1) 配置 Docker 镜像加速"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo mkdir -p /etc/docker && cat > /tmp/daemon.json <<'JSON'
{
  \"registry-mirrors\": [\"${ALIYUN_MIRROR}\"],
  \"log-driver\": \"json-file\",
  \"log-opts\": {
    \"max-size\": \"10m\",
    \"max-file\": \"3\"
  }
}
JSON
sudo mv /tmp/daemon.json /etc/docker/daemon.json
sudo systemctl daemon-reload || true"

echo "==> 2) 安装 Git"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'if ! command -v git >/dev/null 2>&1; then
  sudo dnf install -y git || sudo yum install -y git
fi
sudo git --version'

echo "==> 3) 安装 Docker"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'if ! command -v docker >/dev/null 2>&1; then
  sudo yum install -y yum-utils device-mapper-persistent-data lvm2
  
  # 先尝试 Docker 官方仓库，失败则切换到阿里云 Docker 镜像仓库
  if ! sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo; then
    echo "官方仓库添加失败，切换到阿里云 Docker 镜像仓库"
    sudo rm -f /etc/yum.repos.d/docker-ce.repo
    sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo -o /etc/yum.repos.d/docker-ce.repo
  fi

  sudo dnf install -y docker-ce docker-ce-cli containerd.io || sudo yum install -y docker-ce docker-ce-cli containerd.io
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker 安装失败，请手动检查仓库和网络。"
  exit 1
fi

sudo systemctl enable docker
sudo systemctl restart docker
sudo docker --version'

echo "==> 4) 安装 Docker Compose"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'if ! command -v docker-compose >/dev/null 2>&1; then
  sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi
sudo docker-compose version || docker compose version'

echo "==> 5) 安装 Nginx"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'if ! command -v nginx >/dev/null 2>&1; then
  sudo dnf install -y nginx || sudo yum install -y nginx
fi
sudo systemctl enable nginx
sudo systemctl restart nginx'

echo "==> 6) 上传 SSL 证书"
scp "${SSH_OPTS[@]}" "$SSL_CERT_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.pem"
scp "${SSH_OPTS[@]}" "$SSL_KEY_PATH" "$SSH_TARGET:/tmp/${DOMAIN}.key"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo mkdir -p /etc/nginx/ssl && sudo mv /tmp/${DOMAIN}.pem /etc/nginx/ssl/${DOMAIN}.crt && sudo mv /tmp/${DOMAIN}.key /etc/nginx/ssl/${DOMAIN}.key && sudo chmod 644 /etc/nginx/ssl/${DOMAIN}.crt && sudo chmod 600 /etc/nginx/ssl/${DOMAIN}.key"

echo "==> 7) 配置 Nginx 站点"
scp "${SSH_OPTS[@]}" "$TMP_NGINX_CONF" "$SSH_TARGET:/tmp/annie-website.conf"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" 'sudo mv /tmp/annie-website.conf /etc/nginx/conf.d/annie-website.conf && sudo nginx -t && sudo systemctl reload nginx'

echo "✅ setup 完成"
