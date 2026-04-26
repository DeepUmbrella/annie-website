# Annie Website 对话接入 superpower 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让 Annie Website 的聊天页通过 Annie 后端桥接到 OpenClaw Gateway，并把 `superpower` 专用 session 的文本回复以 SSE 流式返回到前端。

**架构：** 在后端 chat 模块内新增 `SuperpowerBridgeService` 和本地 `SessionStateStore`，统一处理 Gateway WebSocket、专用 session 生命周期、busy lock、流式事件筛选；`ChatController` 新增 SSE 端点，`ChatService` 负责写入用户消息和落盘 assistant 回复；前端 Chat 页面改为消费 SSE 并实时渲染流式输出。

**技术栈：** NestJS 11、Prisma 7、Jest / Supertest、React 19、Vite、Playwright、SSE、OpenClaw Gateway WebSocket。

---

## 文件结构

**新增文件：**
- `backend/src/modules/chat/bridge/superpower-bridge.types.ts` — 定义 bridge 流事件、session state、Gateway 配置类型
- `backend/src/modules/chat/bridge/session-state.store.ts` — 负责本地持久化专用 session 状态文件
- `backend/src/modules/chat/bridge/session-state.store.spec.ts` — `SessionStateStore` 单测
- `backend/src/modules/chat/bridge/superpower-bridge.service.ts` — Gateway WS 连接、专用 session 恢复/创建、流式桥接、busy lock
- `backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts` — Bridge 核心单测
- `backend/test/chat-stream.e2e-spec.ts` — 后端 SSE 端点 e2e
- `frontend/src/lib/chatStream.ts` — 前端创建 SSE 请求、解析事件、封装回调
- `frontend/tests/e2e/chat-stream.spec.ts` — 聊天流式联调 e2e

**修改文件：**
- `backend/src/config/configuration.ts` — 增加 gateway / superpower chat 相关环境变量
- `backend/src/modules/chat/chat.controller.ts` — 新增 `/chat/:sessionId/stream` SSE 端点，保留现有同步接口或让其委托新逻辑
- `backend/src/modules/chat/chat.service.ts` — 增加会话校验、消息持久化、assistant 回复更新能力
- `backend/src/modules/chat/chat.module.ts` — 注册 bridge 相关 provider
- `backend/src/modules/chat/dto/chat.dto.ts` — 如有需要补充 stream 请求 DTO / 查询字段校验
- `frontend/src/pages/Chat.tsx` — 改成基于 SSE 的发送与增量渲染
- `frontend/tests/e2e/integration.spec.ts` — 如现有聊天用例在此文件中，改为引用新的流式行为或删掉旧假响应假设
- `docs/environment-variables-setup.md` — 补充新增环境变量（若项目已有统一环境文档）

---

### 任务 1：补齐配置与类型边界

**文件：**
- 创建：`backend/src/modules/chat/bridge/superpower-bridge.types.ts`
- 修改：`backend/src/config/configuration.ts`
- 测试：无（本任务以类型/配置编译通过为主）

- [ ] **步骤 1：定义 bridge 核心类型**

```ts
// backend/src/modules/chat/bridge/superpower-bridge.types.ts
export type BridgeStreamEvent =
  | { type: 'start'; requestId: string }
  | { type: 'chunk'; requestId: string; text: string }
  | { type: 'done'; requestId: string; fullText: string }
  | { type: 'error'; requestId: string; code: 'service_unavailable' | 'session_busy' | 'timeout' | 'upstream_error'; message: string };

export type DedicatedSessionState = {
  sessionKey: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SuperpowerGatewayConfig = {
  url: string;
  token: string;
  targetAgent: string;
  sessionLabel: string;
  stateFilePath: string;
  firstChunkTimeoutMs: number;
  idleTimeoutMs: number;
};
```

- [ ] **步骤 2：在配置层增加 gateway / chat bridge 配置项**

```ts
// backend/src/config/configuration.ts
  gateway: {
    url: process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789/ws',
    token: process.env.OPENCLAW_GATEWAY_TOKEN,
  },
  superpowerChat: {
    targetAgent: process.env.OPENCLAW_SUPERPOWER_AGENT || 'superpower',
    sessionLabel: process.env.OPENCLAW_SUPERPOWER_SESSION_LABEL || 'annie-chat-runtime',
    stateFilePath: process.env.OPENCLAW_SUPERPOWER_STATE_FILE || '.runtime/superpower-chat-session.json',
    firstChunkTimeoutMs: parseInt(process.env.OPENCLAW_SUPERPOWER_FIRST_CHUNK_TIMEOUT_MS ?? '15000', 10),
    idleTimeoutMs: parseInt(process.env.OPENCLAW_SUPERPOWER_IDLE_TIMEOUT_MS ?? '45000', 10),
  },
```

- [ ] **步骤 3：运行后端构建验证类型无误**

运行：`cd /Users/yanlin/projects/annie-website/backend && npm run build`
预期：Nest 编译通过，无 TypeScript error

- [ ] **步骤 4：Commit**

```bash
git add backend/src/modules/chat/bridge/superpower-bridge.types.ts backend/src/config/configuration.ts
git commit -m "feat(chat): add superpower bridge config types"
```

### 任务 2：实现专用 session 本地状态存储

**文件：**
- 创建：`backend/src/modules/chat/bridge/session-state.store.ts`
- 创建：`backend/src/modules/chat/bridge/session-state.store.spec.ts`
- 测试：`backend/src/modules/chat/bridge/session-state.store.spec.ts`

- [ ] **步骤 1：编写失败的状态存储测试**

```ts
// backend/src/modules/chat/bridge/session-state.store.spec.ts
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SessionStateStore } from './session-state.store';

describe('SessionStateStore', () => {
  it('persists and reloads dedicated session state', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-chat-'));
    const file = join(dir, 'session.json');
    const store = new SessionStateStore(file);

    await store.save({
      sessionKey: 'session:annie-chat-runtime',
      sessionId: 'abc123',
      createdAt: '2026-04-26T00:00:00.000Z',
      updatedAt: '2026-04-26T00:00:00.000Z',
    });

    await expect(store.load()).resolves.toMatchObject({
      sessionKey: 'session:annie-chat-runtime',
      sessionId: 'abc123',
    });

    rmSync(dir, { recursive: true, force: true });
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`cd /Users/yanlin/projects/annie-website/backend && npx jest src/modules/chat/bridge/session-state.store.spec.ts --runInBand`
预期：FAIL，报错 `Cannot find module './session-state.store'`

- [ ] **步骤 3：编写最小存储实现**

```ts
// backend/src/modules/chat/bridge/session-state.store.ts
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { DedicatedSessionState } from './superpower-bridge.types';

export class SessionStateStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<DedicatedSessionState | null> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as DedicatedSessionState;
    } catch {
      return null;
    }
  }

  async save(state: DedicatedSessionState): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf8');
  }
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`cd /Users/yanlin/projects/annie-website/backend && npx jest src/modules/chat/bridge/session-state.store.spec.ts --runInBand`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add backend/src/modules/chat/bridge/session-state.store.ts backend/src/modules/chat/bridge/session-state.store.spec.ts
git commit -m "feat(chat): persist dedicated superpower session state"
```

### 任务 3：先用测试锁定 BridgeService 的 busy / timeout / 事件标准化

**文件：**
- 创建：`backend/src/modules/chat/bridge/superpower-bridge.service.ts`
- 创建：`backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts`
- 修改：`backend/src/modules/chat/chat.module.ts`
- 测试：`backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts`

- [ ] **步骤 1：编写失败的 BridgeService 测试**

```ts
// backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts
import { SuperpowerBridgeService } from './superpower-bridge.service';

describe('SuperpowerBridgeService', () => {
  it('rejects concurrent stream requests with session_busy', async () => {
    const service = new SuperpowerBridgeService(/* mocked deps */);

    service['busy'] = true;

    await expect(service.sendMessageStream({
      requestId: 'req-2',
      message: 'hello',
    })).rejects.toMatchObject({ code: 'session_busy' });
  });

  it('normalizes upstream text events into chunk and done events', async () => {
    const service = new SuperpowerBridgeService(/* mocked deps */);
    const events = await service.__testCollectFromFrames([
      { kind: 'text', text: '你好' },
      { kind: 'text', text: '世界' },
      { kind: 'done' },
    ]);

    expect(events).toEqual([
      { type: 'start', requestId: 'req-1' },
      { type: 'chunk', requestId: 'req-1', text: '你好' },
      { type: 'chunk', requestId: 'req-1', text: '世界' },
      { type: 'done', requestId: 'req-1', fullText: '你好世界' },
    ]);
  });
});
```

- [ ] **步骤 2：运行测试验证失败**

运行：`cd /Users/yanlin/projects/annie-website/backend && npx jest src/modules/chat/bridge/superpower-bridge.service.spec.ts --runInBand`
预期：FAIL，报错 `Cannot find module './superpower-bridge.service'`

- [ ] **步骤 3：实现最小 BridgeService 骨架与可测试纯逻辑**

```ts
// backend/src/modules/chat/bridge/superpower-bridge.service.ts
import { Injectable } from '@nestjs/common';
import { BridgeStreamEvent } from './superpower-bridge.types';

@Injectable()
export class SuperpowerBridgeService {
  private busy = false;

  async sendMessageStream(input: { requestId: string; message: string }): Promise<AsyncGenerator<BridgeStreamEvent>> {
    if (this.busy) {
      const error = { code: 'session_busy', message: 'Dedicated session is busy' };
      throw error;
    }
    throw new Error('Not implemented');
  }

  async __testCollectFromFrames(frames: Array<{ kind: 'text' | 'done'; text?: string }>): Promise<BridgeStreamEvent[]> {
    const requestId = 'req-1';
    let fullText = '';
    const events: BridgeStreamEvent[] = [{ type: 'start', requestId }];

    for (const frame of frames) {
      if (frame.kind === 'text' && frame.text) {
        fullText += frame.text;
        events.push({ type: 'chunk', requestId, text: frame.text });
      }
      if (frame.kind === 'done') {
        events.push({ type: 'done', requestId, fullText });
      }
    }

    return events;
  }
}
```

- [ ] **步骤 4：在模块里注册 BridgeService**

```ts
// backend/src/modules/chat/chat.module.ts
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [ChatService, SuperpowerBridgeService],
})
export class ChatModule {}
```

- [ ] **步骤 5：运行测试验证通过**

运行：`cd /Users/yanlin/projects/annie-website/backend && npx jest src/modules/chat/bridge/superpower-bridge.service.spec.ts --runInBand`
预期：PASS

- [ ] **步骤 6：Commit**

```bash
git add backend/src/modules/chat/bridge/superpower-bridge.service.ts backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts backend/src/modules/chat/chat.module.ts
git commit -m "feat(chat): add bridge service skeleton and guards"
```

### 任务 4：实现后端聊天持久化补口

**文件：**
- 修改：`backend/src/modules/chat/chat.service.ts`
- 测试：`backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts`（mock ChatService 时引用新增方法）

- [ ] **步骤 1：先定义 ChatService 新接口并补最小单元测试替身需求**

```ts
// 计划中的新增方法
createUserMessage(sessionId: string, userId: string, content: string)
createAssistantPlaceholder(sessionId: string)
finalizeAssistantMessage(messageId: string, content: string)
assertSessionOwnership(sessionId: string, userId: string)
```

- [ ] **步骤 2：在 ChatService 中实现最小持久化逻辑**

```ts
// backend/src/modules/chat/chat.service.ts
async assertSessionOwnership(sessionId: string, userId: string) {
  const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw new Error('无权访问此会话');
  }
  return session;
}

async createUserMessage(sessionId: string, userId: string, content: string) {
  await this.assertSessionOwnership(sessionId, userId);
  return this.prisma.message.create({ data: { sessionId, role: 'USER', content } });
}

async createAssistantPlaceholder(sessionId: string) {
  return this.prisma.message.create({ data: { sessionId, role: 'ASSISTANT', content: '' } });
}

async finalizeAssistantMessage(messageId: string, content: string) {
  return this.prisma.message.update({ where: { id: messageId }, data: { content } });
}
```

- [ ] **步骤 3：保留旧同步接口但委托到新逻辑或显式标记废弃**

```ts
async sendMessage(sessionId: string, userId: string, content: string) {
  const userMessage = await this.createUserMessage(sessionId, userId, content);
  const assistantMessage = await this.createAssistantPlaceholder(sessionId);
  return { userMessage, assistantMessage };
}
```

- [ ] **步骤 4：运行后端构建验证无回归**

运行：`cd /Users/yanlin/projects/annie-website/backend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add backend/src/modules/chat/chat.service.ts
git commit -m "refactor(chat): split message persistence for streaming flow"
```

### 任务 5：把 BridgeService 接到真实 Gateway WebSocket 与专用 session 生命周期

**文件：**
- 修改：`backend/src/modules/chat/bridge/superpower-bridge.service.ts`
- 修改：`backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts`
- 修改：`backend/src/modules/chat/chat.module.ts`
- 修改：`backend/src/config/configuration.ts`
- 测试：`backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts`

- [ ] **步骤 1：扩展失败测试，锁定 session 恢复 / 重建顺序**

```ts
it('loads persisted session state before creating a new dedicated session', async () => {
  const store = { load: jest.fn().mockResolvedValue({ sessionKey: 'session:annie-chat-runtime' }), save: jest.fn() };
  const gateway = { ensureSession: jest.fn().mockResolvedValue({ sessionKey: 'session:annie-chat-runtime' }) };
  const service = new SuperpowerBridgeService(store as any, gateway as any, mockConfig as any);

  await service.ensureDedicatedSession();

  expect(store.load).toHaveBeenCalled();
  expect(gateway.ensureSession).toHaveBeenCalledWith('session:annie-chat-runtime');
});
```

- [ ] **步骤 2：实现 Gateway client 抽象与专用 session 确认流程**

```ts
// superpower-bridge.service.ts 内部结构
private async ensureDedicatedSession() {
  const stored = await this.stateStore.load();
  if (stored) {
    const existing = await this.gatewayClient.ensureSession(stored.sessionKey);
    if (existing) return existing;
  }

  const created = await this.gatewayClient.createDedicatedSession({
    agentId: this.config.targetAgent,
    label: this.config.sessionLabel,
  });

  await this.stateStore.save({
    sessionKey: created.sessionKey,
    sessionId: created.sessionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return created;
}
```

- [ ] **步骤 3：实现 sendMessageStream 的请求期锁与超时**

```ts
async *sendMessageStream(input: SendMessageStreamInput): AsyncGenerator<BridgeStreamEvent> {
  if (this.busy) {
    throw { code: 'session_busy', message: 'Dedicated session is busy' };
  }

  this.busy = true;
  try {
    const session = await this.ensureDedicatedSession();
    yield { type: 'start', requestId: input.requestId };

    const upstream = this.gatewayClient.streamChat({
      sessionKey: session.sessionKey,
      text: input.message,
      requestId: input.requestId,
    });

    let fullText = '';
    for await (const frame of withTimeouts(upstream, this.config)) {
      if (frame.kind === 'text' && frame.text) {
        fullText += frame.text;
        yield { type: 'chunk', requestId: input.requestId, text: frame.text };
      }
    }

    yield { type: 'done', requestId: input.requestId, fullText };
  } catch (error) {
    yield normalizeBridgeError(input.requestId, error);
  } finally {
    this.busy = false;
  }
}
```

- [ ] **步骤 4：运行桥接单测**

运行：`cd /Users/yanlin/projects/annie-website/backend && npx jest src/modules/chat/bridge/superpower-bridge.service.spec.ts --runInBand`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add backend/src/modules/chat/bridge/superpower-bridge.service.ts backend/src/modules/chat/bridge/superpower-bridge.service.spec.ts backend/src/modules/chat/chat.module.ts backend/src/config/configuration.ts
git commit -m "feat(chat): connect bridge service to gateway session lifecycle"
```

### 任务 6：新增后端 SSE 端点并接上消息落盘

**文件：**
- 修改：`backend/src/modules/chat/chat.controller.ts`
- 修改：`backend/src/modules/chat/chat.service.ts`
- 创建：`backend/test/chat-stream.e2e-spec.ts`
- 测试：`backend/test/chat-stream.e2e-spec.ts`

- [ ] **步骤 1：先写失败的 e2e，锁定 SSE 返回格式**

```ts
// backend/test/chat-stream.e2e-spec.ts
it('streams assistant chunks through /chat/:sessionId/stream', async () => {
  return request(app.getHttpServer())
    .post(`/chat/${sessionId}/stream`)
    .set('Authorization', `Bearer ${token}`)
    .send({ message: '你好' })
    .expect(201)
    .expect('content-type', /text\/event-stream/);
});
```

- [ ] **步骤 2：运行 e2e 验证失败**

运行：`cd /Users/yanlin/projects/annie-website/backend && npm run test:e2e -- chat-stream.e2e-spec.ts`
预期：FAIL，404 或 controller 未实现

- [ ] **步骤 3：在 controller 中新增 SSE 端点**

```ts
// backend/src/modules/chat/chat.controller.ts
@Post(':sessionId/stream')
@Header('Content-Type', 'text/event-stream')
@Header('Cache-Control', 'no-cache')
async streamMessage(
  @Param('sessionId') sessionId: string,
  @CurrentUser() userId: string,
  @Body() dto: SendMessageDto,
  @Res() res: Response,
) {
  const requestId = randomUUID();
  const userMessage = await this.chatService.createUserMessage(sessionId, userId, dto.message);
  const assistantMessage = await this.chatService.createAssistantPlaceholder(sessionId);

  for await (const event of this.bridge.sendMessageStream({ requestId, sessionId, userId, message: dto.message })) {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event)}\n\n`);

    if (event.type === 'done') {
      await this.chatService.finalizeAssistantMessage(assistantMessage.id, event.fullText);
      res.end();
    }

    if (event.type === 'error') {
      res.end();
    }
  }
}
```

- [ ] **步骤 4：在 e2e 测试里 mock BridgeService，验证 SSE 事件序列**

```ts
const bridgeMock = {
  async *sendMessageStream() {
    yield { type: 'start', requestId: 'req-1' };
    yield { type: 'chunk', requestId: 'req-1', text: '你好' };
    yield { type: 'done', requestId: 'req-1', fullText: '你好' };
  },
};
```

- [ ] **步骤 5：运行 e2e 验证通过**

运行：`cd /Users/yanlin/projects/annie-website/backend && npm run test:e2e -- chat-stream.e2e-spec.ts`
预期：PASS

- [ ] **步骤 6：Commit**

```bash
git add backend/src/modules/chat/chat.controller.ts backend/src/modules/chat/chat.service.ts backend/test/chat-stream.e2e-spec.ts
git commit -m "feat(chat): add streaming chat endpoint backed by bridge"
```

### 任务 7：前端接入 SSE 并实时渲染

**文件：**
- 创建：`frontend/src/lib/chatStream.ts`
- 修改：`frontend/src/pages/Chat.tsx`
- 测试：`frontend/tests/e2e/chat-stream.spec.ts`

- [ ] **步骤 1：先写失败的 Playwright 用例**

```ts
// frontend/tests/e2e/chat-stream.spec.ts
test('chat page renders streamed assistant chunks', async ({ page }) => {
  await page.goto('/chat');
  await page.getByPlaceholder('输入消息...').fill('你好');
  await page.getByRole('button', { name: '发送' }).click();

  await expect(page.getByText('正在回复...')).toBeVisible();
  await expect(page.getByText('你好，世界')).toBeVisible();
});
```

- [ ] **步骤 2：运行前端 e2e 验证失败**

运行：`cd /Users/yanlin/projects/annie-website/frontend && npm run test:e2e -- chat-stream.spec.ts`
预期：FAIL，当前页面仍依赖同步 axios 返回

- [ ] **步骤 3：增加前端 stream helper**

```ts
// frontend/src/lib/chatStream.ts
export function streamChatMessage({ sessionId, token, message, onEvent }: StreamArgs) {
  const url = `${API}/api/v1/chat/${sessionId}/stream`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ message }),
  }).then(async (response) => {
    const reader = response.body?.getReader();
    // 逐块解析 SSE，按 event/data 回调 onEvent
  });
}
```

- [ ] **步骤 4：在 Chat 页面改成 optimistic user message + streaming assistant draft**

```tsx
// frontend/src/pages/Chat.tsx 核心更新
setSessions((prev) => appendUserMessage(prev, activeSessionId, optimisticUserMessage));
setStreamingMessage({ role: 'ASSISTANT', content: '' });

await streamChatMessage({
  sessionId: activeSessionId,
  token,
  message: content,
  onEvent: (event) => {
    if (event.type === 'chunk') {
      setStreamingText((prev) => prev + event.text);
    }
    if (event.type === 'done') {
      mergeStreamingAssistantIntoSession(event.fullText);
    }
  },
});
```

- [ ] **步骤 5：处理 busy / timeout / service_unavailable 提示**

```ts
if (event.type === 'error') {
  message.error(ERROR_MESSAGES[event.code] || event.message);
  clearStreamingDraft();
}
```

- [ ] **步骤 6：运行前端 e2e 验证通过**

运行：`cd /Users/yanlin/projects/annie-website/frontend && npm run test:e2e -- chat-stream.spec.ts`
预期：PASS

- [ ] **步骤 7：Commit**

```bash
git add frontend/src/lib/chatStream.ts frontend/src/pages/Chat.tsx frontend/tests/e2e/chat-stream.spec.ts
git commit -m "feat(chat): render streamed superpower responses in chat page"
```

### 任务 8：补充环境文档与最终验证

**文件：**
- 修改：`docs/environment-variables-setup.md`
- 测试：后端 + 前端最小回归

- [ ] **步骤 1：在文档中补充新增环境变量**

```md
## Superpower Chat Bridge
- `OPENCLAW_GATEWAY_URL`：OpenClaw Gateway WebSocket 地址
- `OPENCLAW_GATEWAY_TOKEN`：Gateway 鉴权 token
- `OPENCLAW_SUPERPOWER_AGENT`：默认 `superpower`
- `OPENCLAW_SUPERPOWER_SESSION_LABEL`：专用 session 标签
- `OPENCLAW_SUPERPOWER_STATE_FILE`：专用 session 状态文件路径
- `OPENCLAW_SUPERPOWER_FIRST_CHUNK_TIMEOUT_MS`
- `OPENCLAW_SUPERPOWER_IDLE_TIMEOUT_MS`
```

- [ ] **步骤 2：运行后端单测 + e2e**

运行：
```bash
cd /Users/yanlin/projects/annie-website/backend
npx jest src/modules/chat/bridge/session-state.store.spec.ts src/modules/chat/bridge/superpower-bridge.service.spec.ts --runInBand
npm run test:e2e -- chat-stream.e2e-spec.ts
```

预期：全部 PASS

- [ ] **步骤 3：运行前端 Playwright 聊天用例**

运行：
```bash
cd /Users/yanlin/projects/annie-website/frontend
npm run test:e2e -- chat-stream.spec.ts
```

预期：PASS

- [ ] **步骤 4：运行前后端构建**

运行：
```bash
cd /Users/yanlin/projects/annie-website/backend && npm run build
cd /Users/yanlin/projects/annie-website/frontend && npm run build
```

预期：两个 build 都 PASS

- [ ] **步骤 5：Commit**

```bash
git add docs/environment-variables-setup.md
git commit -m "docs(chat): document superpower bridge environment variables"
```
