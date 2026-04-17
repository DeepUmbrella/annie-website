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
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no)
REPO_URL="https://github.com/DeepUmbrella/annie-website.git"
REMOTE_DIR="/root/annie-website"
COMPOSE_CMD="docker compose"
DATABASE_URL="postgresql://annie:${POSTGRES_PASSWORD}@postgres:5432/annie_db?schema=public"

TMP_ROOT_ENV="$(mktemp)"
TMP_BACKEND_ENV="$(mktemp)"
trap 'rm -f "$TMP_ROOT_ENV" "$TMP_BACKEND_ENV"' EXIT

cat >"$TMP_ROOT_ENV" <<EOF
NODE_ENV=production
BACKEND_PORT=3001
CORS_ORIGIN=https://${DOMAIN}
POSTGRES_USER=annie
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=annie_db
DATABASE_URL=${DATABASE_URL}
REDIS_URL=redis://redis:6379
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ANNIE_API_URL=https://annie-api.${DOMAIN}
ANNIE_API_KEY=your-annie-api-key
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

echo "==> 1) 获取项目代码"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "if [ -d $REMOTE_DIR/.git ]; then
  cd $REMOTE_DIR
  git remote set-url origin $REPO_URL 2>/dev/null || git remote add origin $REPO_URL
  git fetch origin
  (git checkout main 2>/dev/null || git checkout master 2>/dev/null || true)
  (git pull --rebase origin main || git pull --rebase origin master)
else
  rm -rf $REMOTE_DIR && git clone --branch main $REPO_URL $REMOTE_DIR || git clone $REPO_URL $REMOTE_DIR
fi"

echo "==> 2) 上传环境变量文件"
scp "${SSH_OPTS[@]}" "$TMP_ROOT_ENV" "$SSH_TARGET:/tmp/annie-root.env"
scp "${SSH_OPTS[@]}" "$TMP_BACKEND_ENV" "$SSH_TARGET:/tmp/annie-backend.env"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "sudo mv /tmp/annie-root.env $REMOTE_DIR/.env && sudo mv /tmp/annie-backend.env $REMOTE_DIR/backend/.env && sudo chmod 600 $REMOTE_DIR/.env $REMOTE_DIR/backend/.env"

echo "==> 3) 检查 Docker 镜像加速并启动服务"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "set -e
MIRRORS=\$(docker info --format '{{json .RegistryConfig.Mirrors}}' 2>/dev/null || echo '[]')
if [ \"\$MIRRORS\" = '[]' ] || [ -z \"\$MIRRORS\" ]; then
  echo 'Docker 镜像加速未生效，请先重新执行 setup-server.sh 并确认 docker 已重启。'
  exit 1
fi

for IMG in 'postgres:15' 'redis:7' 'getmeili/meilisearch:v1.3'; do
  docker pull \"\$IMG\"
done

cd $REMOTE_DIR && ${COMPOSE_CMD} up -d --build"

sleep 20

echo "==> 4) 初始化数据库"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "cd $REMOTE_DIR && ${COMPOSE_CMD} exec -T backend sh -lc 'npx prisma generate && npx prisma migrate deploy'"

echo "==> 5) 检查服务状态"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "cd $REMOTE_DIR && ${COMPOSE_CMD} ps && ${COMPOSE_CMD} logs --tail=20 backend"

echo "✅ deploy 完成"
