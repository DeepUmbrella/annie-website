# 快速开始

欢迎来到 Annie AI 助手！本指南将帮助你快速上手 Annie API。

## 前提条件

- Node.js 18+
- npm 或 yarn
- 获取了 Annie API 密钥

## 安装

```bash
npm install @annie/sdk
```

## 基本使用

```javascript
import { AnnieClient } from '@annie/sdk';

const client = new AnnieClient({
  apiKey: 'your-api-key',
});

// 发送消息
const response = await client.chat({
  message: '你好，Annie！',
});

console.log(response.reply);
```

## 认证

如需使用认证功能，请参考 [认证 API 文档](/api/authentication.md)。

## 对话

完整的对话 API 文档，请参阅 [对话 API 文档](/api/chat.md)。
