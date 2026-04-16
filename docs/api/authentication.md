# 认证 API

认证 API 提供用户注册、登录和个人资料管理功能。

## 端点

### 注册

**POST** `/api/v1/auth/register`

注册新用户。

**请求体：**
```json
{
  "username": "testuser",
  "email": "test@example.com",
.com"  "password": "securepassword123"
}
```

**响应：**
```json
{
  "message": "注册成功",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "profile": null
  },
  "token": "jwt-token"
}
```

### 登录

**POST** `/api/v1/auth/login`

使用邮箱和密码登录。

**请求体：**
```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**响应：**
```json
{
  "message": "登录成功",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "profile": null
  },
  "token": "jwt-token"
}
```

### 获取当前用户

**GET** `/api/v1/auth/me`

获取当前登录用户的信息。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "user": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "role": "USER",
    "profile": {
      "userId": "uuid",
      "displayName": "Test User",
      "avatarUrl": null,
      "bio": null
    }
  }
}
```

### 更新个人资料

**PUT** `/api/v1/auth/profile`

更新当前用户的个人资料。

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "displayName": "New Display Name",
  "bio": "My bio"
}
```

**响应：**
```json
{
  "message": "个人资料更新成功",
  "profile": {
    "userId": "uuid",
    "displayName": "New Display Name",
    "avatarUrl": null,
    "bio": "My bio"
  }
}
```

## 错误码

- `400` - 请求参数错误
- `401` - 未授权或无效凭证
- `409` - 用户名或邮箱已存在
- `500` - 服务器内部错误
