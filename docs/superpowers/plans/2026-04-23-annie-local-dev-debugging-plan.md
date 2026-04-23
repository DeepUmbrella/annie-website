# Annie 本地前后端联调与配置修复实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让 Annie Website 在本地前后端都能稳定启动、互相连通，并把当前暴露的 `PORT` / `CORS` / 前端 API 地址不一致一次收敛掉。

**架构：** 后端 NestJS 作为单一 API 源，前端 Vite React 通过 `VITE_API_URL` 访问后端。本地联调以 `localhost` 为准，避免把 Docker/局域网地址混进默认开发配置。先修配置边界，再做端到端验证，最后固定文档和环境示例。

**技术栈：** NestJS、Vite、React、Axios、Docker Compose、Node.js、TypeScript

---

## 文件清单

**会修改：**
- `backend/src/main.ts`：统一读取配置端口与 CORS origins
- `backend/src/config/configuration.ts`：补齐/对齐后端配置键
- `frontend/src/slices/authSlice.ts`：统一认证接口的 API base 来源
- `frontend/src/pages/Contact.tsx`：统一反馈接口的 API base 来源
- `frontend/src/pages/Docs.tsx`：统一文档搜索接口的 API base 来源
- `.env.local.example`：修正本地开发示例值
- `frontend/.env.example`：补齐前端本地联调示例
- `README.md`：更新本地联调说明
- `docs/environment-variables-setup.md`：补充本地联调变量解释

**会新增：**
- `frontend/.env.local`（本地开发实际使用，开发者自行生成）
- `backend/.env.local`（本地开发实际使用，开发者自行生成）

**会测试：**
- `backend/test/app.e2e-spec.ts`（或等价健康检查测试）
- `frontend/src/...` 现有页面的联调验证由构建与浏览器访问完成

---

### 任务 1：确认并统一后端启动配置

**文件：**
- 修改：`backend/src/main.ts`
- 修改：`backend/src/config/configuration.ts`
- 测试：`backend/test/app.e2e-spec.ts`（若当前已有健康检查测试则复用）

- [ ] **步骤 1：写一个能暴露端口读取不一致的测试**

```ts
it('uses the configured app port when starting the app', async () => {
  process.env.PORT = '3001';
  // 断言健康接口在 3001 可访问，或断言 config service 读取到的端口值与 app.port 一致
});
```

- [ ] **步骤 2：运行测试确认当前行为/失败点**

运行：`npm run test:e2e -- --runInBand`
预期：要么失败于配置不一致，要么证明当前启动端口与配置键不一致。

- [ ] **步骤 3：把启动入口改成单一来源**

```ts
const port =
  configService.get<number>('app.port') ??
  configService.get<number>('PORT') ??
  3000;
```

并让 CORS 继续从 `CORS_ORIGIN` 读取，但默认值保持 `localhost` 联调集合。

- [ ] **步骤 4：重新运行测试验证通过**

运行：`npm run build && npm run test:e2e -- --runInBand`
预期：编译通过，健康检查通过，服务端口与配置一致。

- [ ] **步骤 5：commit**

```bash
git add backend/src/main.ts backend/src/config/configuration.ts backend/test/app.e2e-spec.ts
git commit -m "fix(backend): align local bootstrap config"
```

---

### 任务 2：统一前端 API base 的联调入口

**文件：**
- 修改：`frontend/src/slices/authSlice.ts`
- 修改：`frontend/src/pages/Contact.tsx`
- 修改：`frontend/src/pages/Docs.tsx`
- 新增：`frontend/.env.example`
- 测试：`frontend` 构建与浏览器访问

- [ ] **步骤 1：写一个最小的环境变量检查**

```ts
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

把当前硬编码的 `3001` 改成与本地后端一致的默认值。

- [ ] **步骤 2：运行前端构建确认无语法/类型问题**

运行：`npm run build`
预期：构建通过，且打包后请求默认指向 `http://localhost:3000`。

- [ ] **步骤 3：补齐前端环境样例**

```env
VITE_API_URL=http://localhost:3000
```

- [ ] **步骤 4：验证页面请求路径**

运行：`npm run dev -- --host 0.0.0.0`
在浏览器中检查登录、文档搜索、反馈表单都命中 `http://localhost:3000/api/v1/...`。

- [ ] **步骤 5：commit**

```bash
git add frontend/src/slices/authSlice.ts frontend/src/pages/Contact.tsx frontend/src/pages/Docs.tsx frontend/.env.example
git commit -m "fix(frontend): align local api base url"
```

---

### 任务 3：整理本地环境样例与说明文档

**文件：**
- 修改：`.env.local.example`
- 修改：`README.md`
- 修改：`docs/environment-variables-setup.md`

- [ ] **步骤 1：把本地样例值收敛到 localhost**

```env
BACKEND_PORT=3001
DATABASE_URL=postgresql://annie:annie_secure_pass@localhost:5432/annie_db?schema=public
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

- [ ] **步骤 2：更新 README 的本地联调步骤**

```md
cp .env.local.example .env.local
cp backend/.env.example backend/.env.local
# 后端默认用 3000，前端默认用 5173，API 默认指向 http://localhost:3000
```

- [ ] **步骤 3：补齐环境变量文档**

明确说明：
- `BACKEND_PORT` 是 Docker/根环境中的后端端口
- `PORT` 仅用于后端进程直接启动时
- `VITE_API_URL` 是前端联调入口

- [ ] **步骤 4：检查文档无歧义**

运行：`grep -R "3001\|localhost:3000\|VITE_API_URL" -n README.md docs/environment-variables-setup.md .env.local.example frontend/.env.example`
预期：样例和说明一致，没有互相打架的默认值。

- [ ] **步骤 5：commit**

```bash
git add .env.local.example README.md docs/environment-variables-setup.md
git commit -m "docs(dev): clarify local environment setup"
```

---

### 任务 4：做一次端到端联调验收

**文件：**
- 不新增代码，使用现有前后端与 Docker/本地进程

- [ ] **步骤 1：重新启动后端与前端**

```bash
cd backend && npm run start:dev
cd frontend && npm run dev -- --host 0.0.0.0
```

- [ ] **步骤 2：验证健康接口**

```bash
curl -i http://localhost:3000/health
```

预期：`200 OK`。

- [ ] **步骤 3：验证前端页面能访问后端**

在浏览器中打开首页，执行登录/文档搜索/反馈提交的请求路径检查。

- [ ] **步骤 4：记录结果**

把本次联调结果写进工作日志或提交说明，保留启动端口、访问地址与残余警告。

- [ ] **步骤 5：commit**

```bash
git add -A
git commit -m "test(dev): verify local frontend backend integration"
```

---

## 自检

1. **规格覆盖度：** 已覆盖后端端口、CORS、前端 API base、本地环境样例和联调验收。
2. **占位符扫描：** 未使用“待定 / TODO / 后续实现”之类占位符。
3. **类型一致性：** `app.port`、`VITE_API_URL`、`CORS_ORIGIN` 在所有任务中保持一致。
4. **范围检查：** 这是一个单一的本地联调与配置收敛计划，没有拆成多个独立产品子项目。

---

计划已准备好，后续执行建议优先用 **子代理驱动**。