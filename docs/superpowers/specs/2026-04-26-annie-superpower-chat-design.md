# Annie Website 对话接入 superpower 设计

日期：2026-04-26
状态：待审查

## 1. 背景与目标

目标是将 Annie Website 的对话能力接入 OpenClaw 的 `superpower` agent，使 Annie 前端发出的聊天请求能够由 `superpower` 处理并将回复返回给 Annie 前端。

本次设计明确排除错误方案：
- 不采用“将 Annie chat API 封装为 MCP 再供 superpower 调用”的方案。

本次采用的正确方向是：
- Annie 前端 → Annie 后端 → OpenClaw Gateway WebSocket → `superpower` 专用 session → Annie 后端 → Annie 前端。

## 2. 本阶段范围

本阶段只做最小可用版（MVP）：

- 复用现有 `superpower` agent
- 使用一个专用 session 处理 Annie 对话
- 该 session 按 Annie 后端服务启动周期复用
- 前端接收流式回复
- 同一时刻只允许一个请求占用该专用 session

本阶段明确不做：
- 按 Annie 用户做 session 隔离
- 新建独立 `annie-chat` agent
- 多请求排队调度
- 非文本输出完整支持

## 3. 设计决策

### 3.1 Agent 与 Session 策略

- 先复用现有 `superpower` agent
- Annie 后端在启动时恢复或创建一个专用 session
- 服务运行期间所有 Annie 对话请求都发往该专用 session
- 服务重启后优先恢复既有 session；恢复失败则重建

这样做的原因：
- 改动最小，最快验证链路
- 不污染日常 `agent:superpower:main` 主会话
- 后续可平滑升级到独立 agent

### 3.2 传输与交互策略

- Annie 后端通过 Gateway WebSocket 与 OpenClaw 通信
- Annie 前端通过 SSE 接收后端流式输出
- Annie 后端负责将 Gateway 事件转为前端可消费的 SSE 事件

### 3.3 并发策略

- 最小版使用单专用 session
- 同时只允许一个请求占用该 session
- 若已有请求进行中，后续请求直接返回 `session_busy`

选择拒绝并发而不是排队的原因：
- 行为简单
- 更容易验证链路与排障
- 避免同一 session 串流

## 4. 模块边界

### 4.1 Chat Controller

职责：
- 接收 Annie 前端消息
- 建立 SSE 响应
- 调用 `SuperpowerBridgeService`
- 将 bridge 输出转为 SSE 事件

不负责：
- 直接管理 Gateway WebSocket
- 管理专用 session 生命周期
- 处理 OpenClaw 协议细节

### 4.2 SuperpowerBridgeService

职责：
- 管理 Gateway WebSocket 连接
- 在服务启动时恢复/创建专用 session
- 发送消息到目标 session
- 订阅并筛选属于当前请求的回复事件
- 向上层输出标准化流事件：`start`、`chunk`、`done`、`error`
- 管理 session busy lock

这是 Annie 与 OpenClaw 之间的核心协议适配层。

### 4.3 SessionRegistry / RuntimeState

职责：
- 保存当前服务实例绑定的专用 session 信息
- 服务重启时恢复 session
- session 失效时重建并更新状态

最小版建议采用本地持久化状态文件，而不是先引入数据库表。

### 4.4 前端 Chat SSE Client

职责：
- 建立 SSE 连接
- 接收 `start`、`chunk`、`done`、`error`
- 实时渲染 assistant 输出
- 在 `done` 时落成完整消息

前端不需要理解 Gateway、agent、session 的内部概念。

## 5. 数据流

1. Annie 前端发起一条聊天请求并建立 SSE
2. Annie 后端 `ChatController` 接收请求
3. `ChatController` 调用 `SuperpowerBridgeService.sendMessageStream(...)`
4. `SuperpowerBridgeService` 确认当前专用 session 可用
   - 若不存在或失效，则恢复或重建
5. `SuperpowerBridgeService` 通过 Gateway WebSocket 向目标 session 发送消息
6. `SuperpowerBridgeService` 订阅并筛选本次请求对应的回复事件
7. Bridge 将事件标准化为 `start` / `chunk` / `done` / `error`
8. `ChatController` 将这些事件转发为 SSE
9. Annie 前端按 chunk 实时渲染，`done` 后结束本轮显示

## 6. 错误处理与稳定性

### 6.1 Gateway 连接失败

- 启动时连不上 Gateway 或运行中断连时，`SuperpowerBridgeService` 自动重连
- 重连期间，新请求直接返回 `service_unavailable`
- 不挂起请求等待连接恢复

### 6.2 专用 Session 丢失

- 请求进入时检查目标 session 是否可用
- 不可用则按“恢复 → 重建 → 更新本地状态”顺序处理

### 6.3 请求超时

设置两层超时：
- 首包超时：10~15 秒
- 流中超时：30~60 秒无新 chunk

超时后：
- 返回 `error`
- 关闭 SSE
- 释放 busy lock

### 6.4 并发冲突

- 若专用 session 正被占用，后续请求立即返回 `session_busy`

### 6.5 非文本输出

最小版仅消费文本输出：
- 非文本输出忽略或降级为提示文本
- 不在本阶段支持图片、附件、复杂工具输出

### 6.6 SSE 中断

- 若前端断开连接，后端立即停止本次流等待并释放 busy lock

### 6.7 日志要求

至少记录以下字段：
- requestId
- targetSessionKey
- gateway connection state
- send timestamp
- first chunk timestamp
- done / error reason
- timeout / busy / reconnect 统计

## 7. 测试策略

### 7.1 主链路联调

验证：
- 前端发消息
- 后端成功转发到 Gateway
- `superpower` 专用 session 收到消息
- 前端收到流式 chunk
- 最终正常 `done`

### 7.2 连接类测试

验证：
- Gateway 可连
- Gateway 断开后可重连
- 重连后新请求可继续处理

### 7.3 Session 生命周期测试

验证：
- 首次启动创建/绑定 session
- 服务重启恢复 session
- session 失效后自动重建

### 7.4 流式协议测试

验证：
- `start → chunk → done` 顺序正常
- 中途 `error` 时前端能正确结束
- 浏览器断开连接后后端能及时收尾

### 7.5 并发测试

验证：
- 请求 A 进行中时，请求 B 收到 `session_busy`
- A 完成后，请求 C 可继续进入

### 7.6 超时测试

验证：
- 首包超时
- 流中超时
- 超时后 busy lock 已释放

### 7.7 降级测试

验证：
- 空输出
- 非文本输出
- 异常事件格式

系统目标是安全降级，而非在本阶段完整支持所有类型。

## 8. 方案对比与结论

### 方案 A：业务层直接接 Gateway WebSocket
优点：
- 改动少
- 能快速打通

缺点：
- Gateway 协议细节会污染 Annie chat 业务层
- 后续升级成本更高

### 方案 B：引入 `SuperpowerBridgeService`
优点：
- 协议边界清晰
- 便于后续升级到独立 agent、多 session、排队等能力
- Annie 业务层更干净

缺点：
- 最小版代码量略多

### 结论

采用 **方案 B**：
- Annie 后端内部新增 `SuperpowerBridgeService`
- 由该服务统一处理 Gateway WebSocket、专用 session 生命周期、事件筛选与流式桥接

## 9. 后续演进

本方案为后续演进预留以下路径：
- 单 session → 按 Annie 用户映射多 session
- 复用 `superpower` → 独立 `annie-chat` agent
- busy 拒绝 → 请求排队
- 文本-only → 多模态 / tool-aware 输出

## 10. 成功标准

当以下条件满足时，视为本阶段完成：
- Annie 前端能发起一次聊天请求
- Annie 后端能通过 Gateway 将请求发送到 `superpower` 专用 session
- 前端能稳定接收流式文本回复
- 单 session 忙时能明确返回 busy
- Gateway 断连、session 失效、超时等场景可稳定失败并恢复
