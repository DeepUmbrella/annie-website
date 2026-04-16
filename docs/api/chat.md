# 对话 API

对话 API 提供与 Annie AI 助手进行对话的功能。

## 端点

### 发送消息

**POST** `/api/v1/chat/:sessionId`

在指定会话中发送消息。

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "message": "你好，Annie！"
}
```

**响应：**
```json
{
  "userMessage": {
    "id": "uuid",
    "sessionId": "uuid",
    "role": "USER",
    "content": "你好，Annie！",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "uuid",
    "sessionId": "uuid",
    "role": "ASSISTANT",
    "content": "你好！我是 Annie，很高兴为你服务。",
    "createdAt": "2024-01-01T00:00:01.000Z"
  }
}
```

### 获取会话列表

**GET** `/api/v1/chat/sessions`

获取当前用户的所有对话会话。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "对话标题",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "messages": [
      {
        "id": "uuid",
        "role": "USER",
        "content": "消息内容",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

### 创建新会话

**POST** `/api/v1/chat/sessions`

创建一个新的对话会话。

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "title": "新对话标题" // 可选
}
```

**响应：**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "新对话标题",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 删除会话

**DELETE** `/api/v1/chat/sessions/:sessionId`

删除指定的对话会话。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "message": "会话已删除"
}
```

## 错误码

- `401` - 未授权
- `403` - 权限不足
- `404` - 会话不存在
- `500` - 服务器内部错误

## 注意事项

- 每个 POST 请求都会消耗 Annie API 配额
- 建议在前端实现流式响应以提升用户体验
- 会话中的消息历史会被用于上下文理解
