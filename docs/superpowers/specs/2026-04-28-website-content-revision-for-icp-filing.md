# 网站内容整改设计文档

**日期：** 2026-04-28
**目的：** 配合公安联网备案，网站内容从"Annie AI 助手平台"调整为"个人AI开发笔记"

---

## 一、变更范围

本次为最小改动，仅替换文字内容，不改变视觉风格、页面结构和路由。

---

## 二、各页面变更清单

### 2.1 Header（导航栏 Logo）

| 文件 | 变更 |
|------|------|
| `frontend/src/components/common/Header.tsx` | Logo 文字 "Annie AI" → "个人AI开发笔记" |

### 2.2 Home 首页

| 位置 | 原文 | 改为 |
|------|------|------|
| Hero Badge | "AI Assistant Platform" | "个人AI开发笔记" |
| Hero 主标题 | "让 Annie 成为你的智能协作中枢" | "记录 AI 开发，从这里开始" |
| Hero 副标题 | "连接知识、对话与自动化能力..." | "个人AI开发笔记，分享智能体开发的技术与心得" |
| 立即体验按钮 | `/register` → "立即体验" | `/blog` → "阅读笔记" |
| 查看文档按钮 | `/docs` → "查看文档" | 保持 |
| CTA Section 标题 | "准备好开始使用 Annie 了吗？" | "欢迎来到个人AI开发笔记" |
| CTA 描述 | "用更统一的 AI 交互体验..." | "这里记录 AI 开发过程中的技术笔记、工具心得与踩坑记录" |
| CTA 主按钮 | "开始使用" | "阅读更多" |
| CTA 副按钮 | "查看开发文档" | 保持 |
| 底部浮动卡片（响应速度） | "Annie Core" / "Annie Core" | "开发日志" |
| 底部浮动卡片（知识接入） | "已连接 12 个源" | "持续更新中" |
| 底部浮动卡片（安全状态） | "端到端加密" | 改为"开发记录" |

### 2.3 Features 页

| 位置 | 变更 |
|------|------|
| `frontend/src/pages/Features.tsx` PageHero eyebrow | "Features" → "博客" |
| PageHero title | "欢迎广大网友" → "开发笔记与技术分享" |
| PageHero description | 改为"记录 AI 开发中的技术细节、工具使用与经验总结" |
| Features 模块 items | descriptions 对齐"开发者笔记"风格 |
| 底部 CTA | "立即注册 Annie" → "阅读更多笔记"，链接改为 /blog |

### 2.4 Blog 页

| 位置 | 变更 |
|------|------|
| `frontend/src/pages/Blog.tsx` PageHero eyebrow | "Blog" → "博客" |
| PageHero title | "Annie 博客与更新" → "AI 开发笔记" |
| PageHero description | "这里会放 Annie 的公告..." → "个人 AI 智能体开发过程中的技术记录" |

### 2.5 Contact 页

| 位置 | 变更 |
|------|------|
| `frontend/src/pages/Contact.tsx` PageHero eyebrow | "Contact" → "联系" |
| PageHero title | "与 Annie 团队取得联系" → "关于本站" |
| PageHero description | 改为"记录 AI 开发过程中的问题和心得，欢迎交流" |
| 联系方式卡片邮箱 | support@annie.ai → "linany@linany.com" |
| 联系方式卡片网站 | https://annie.ai → https://www.linany.com |
| 联系方式卡片社区 | 移除或改为 GitHub 链接 |

### 2.6 Footer

| 文件 | 位置 | 变更 |
|------|------|------|
| `frontend/src/components/common/Footer.tsx` | Brand 标题 | "Annie AI" → "个人AI开发笔记" |
| `frontend/src/components/common/Footer.tsx` | Brand 描述 | 改为"个人 AI 开发笔记，记录技术、工具与思考" |
| `frontend/src/components/common/Footer.tsx` | 产品链接文字 | "功能特性" → "博客"；"技术博客" → "技术笔记" |
| `frontend/src/components/common/Footer.tsx` | 版权信息 | "Annie AI 助手 © 2024" → "个人AI开发笔记 © 2024" |

### 2.7 导航栏（Header）

| 位置 | 变更 |
|------|------|
| 导航项 | 去掉"对话"入口 |
| 右侧用户区 | 未登录状态：去掉"登录"和"注册"按钮，改为"关于"链接指向首页或 Contact |

---

## 三、不变更的内容

- 视觉风格（深色玻璃拟态、颜色变量）
- 页面结构（各页面组件不变）
- 路由配置
- 后端代码
- Docker / 部署配置
- 博客文章内容（来自数据库，暂不处理）

---

## 四、实现顺序

1. Header Logo 文字替换
2. Header 导航项调整（去掉对话/登录/注册）
3. Home 首页文字替换
4. Features 页文字替换
5. Blog 页 PageHero 替换
6. Contact 页联系信息替换
7. Footer 全部文字替换
8. git commit

---

## 五、验收标准

- [ ] 导航栏 Logo 显示"个人AI开发笔记"
- [ ] 首页 Hero 主标题、副标题符合新定位
- [ ] Features 页标题/描述符合博客/笔记定位
- [ ] Contact 页联系信息替换为个人联系方式
- [ ] Footer 版权显示"个人AI开发笔记"
- [ ] 导航栏无登录/注册/对话入口
- [ ] 页面能正常加载，无报错
