# 网站内容整改实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将网站内容从"Annie AI 助手平台"调整为"个人AI开发笔记"，配合公安联网备案

**架构：** 最小改动方案 — 仅替换各页面文字内容，不改变视觉风格、页面结构和路由

**技术栈：** React + TypeScript + Ant Design

---

## 文件变更总览

| 文件 | 变更类型 |
|------|---------|
| `frontend/src/components/common/Header.tsx` | 修改 |
| `frontend/src/pages/Home.tsx` | 修改 |
| `frontend/src/pages/Features.tsx` | 修改 |
| `frontend/src/pages/Blog.tsx` | 修改 |
| `frontend/src/pages/Contact.tsx` | 修改 |
| `frontend/src/components/common/Footer.tsx` | 修改 |

---

## 任务 1：Header Logo 与导航栏调整

**文件：** `frontend/src/components/common/Header.tsx`

- [ ] **步骤 1：将 Logo 文字 "Annie AI" 替换为 "个人AI开发笔记"**

找到：
```tsx
<a className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
  Annie AI
</a>
```
改为：
```tsx
<a className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
  个人AI开发笔记
</a>
```

- [ ] **步骤 2：去掉 navItems 中的"对话"入口**

找到：
```tsx
{ key: 'chat', label: '对话', to: '/chat' },
```
删除这一行。

- [ ] **步骤 3：替换未登录状态按钮（去掉登录/注册，改为关于链接）**

找到未登录状态的按钮区块：
```tsx
<button onClick={() => navigate('/login')} ...>登录</button>
<button onClick={() => navigate('/register')} ...>注册</button>
```
改为：
```tsx
<button
  onClick={() => navigate('/contact')}
  className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/[0.12]"
>
  关于
</button>
```

- [ ] **步骤 4：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/components/common/Header.tsx
git commit -m "feat(content): 替换 Logo 为个人AI开发笔记，调整导航栏"
```

---

## 任务 2：Home 首页文字替换

**文件：** `frontend/src/pages/Home.tsx`

- [ ] **步骤 1：替换 Hero Badge**

找到：
```tsx
<span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
  AI Assistant Platform
</span>
```
改为：
```tsx
<span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
  个人AI开发笔记
</span>
```

- [ ] **步骤 2：替换 Hero 主标题**

找到：
```tsx
<h1 className="max-w-4xl text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]">
  让 <span className="bg-gradient-to-r from-white via-annie-lavender to-annie-cyan bg-clip-text text-transparent">Annie</span>
  <br />
  成为你的智能协作中枢
</h1>
```
改为：
```tsx
<h1 className="max-w-4xl text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]">
  记录 AI 开发
  <br />
  从这里开始
</h1>
```

- [ ] **步骤 3：替换 Hero 副标题**

找到：
```tsx
<p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
  连接知识、对话与自动化能力，为个人、团队与开发者提供统一的 AI 工作入口。
</p>
```
改为：
```tsx
<p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
  个人AI开发笔记，分享智能体开发的技术与心得。
</p>
```

- [ ] **步骤 4：替换主 CTA 按钮（"立即体验" → "阅读笔记"，指向 /blog）**

找到：
```tsx
<ButtonLink to="/register">立即体验</ButtonLink>
```
改为：
```tsx
<ButtonLink to="/blog">阅读笔记</ButtonLink>
```

- [ ] **步骤 5：替换底部 CTA 区域标题**

找到：
```tsx
<h2 className="mb-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">
  准备好开始使用 Annie 了吗？
</h2>
```
改为：
```tsx
<h2 className="mb-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">
  欢迎来到个人AI开发笔记
</h2>
```

- [ ] **步骤 6：替换底部 CTA 描述**

找到：
```tsx
<p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
  用更统一的 AI 交互体验连接知识、协作与自动化能力。
</p>
```
改为：
```tsx
<p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
  这里记录 AI 开发过程中的技术笔记、工具心得与踩坑记录。
</p>
```

- [ ] **步骤 7：替换底部 CTA 主按钮（"开始使用" → "阅读更多"）**

找到：
```tsx
<ButtonLink to="/register">开始使用</ButtonLink>
```
改为：
```tsx
<ButtonLink to="/blog">阅读更多</ButtonLink>
```

- [ ] **步骤 8：替换首页 capabilities 模块描述（对齐开发者笔记风格）**

capabilities 数组中，将 description 改为：

```tsx
const capabilities = [
  { title: '智能对话', description: '记录 AI 对话系统的开发实践与优化经验。' },
  { title: '知识检索', description: '整理 AI 知识库、RAG 与向量检索的技术笔记。' },
  { title: '自动化工作流', description: '探索 AI 工作流编排、任务自动化的开发心得。' },
  { title: '开发者接入', description: '分享 API 设计、SDK 集成与开发者工具的经验。' },
  { title: '多端协作', description: '记录在不同平台上接入 AI 能力的开发过程。' },
  { title: '可控与安全', description: '整理 AI 安全、权限控制与合规开发的技术笔记。' },
];
```

- [ ] **步骤 9：替换 scenarios 模块（改为开发者/笔记向）**

找到并替换整个 scenarios 数组：

```tsx
const scenarios = [
  {
    title: '开发笔记',
    description: '记录 AI 开发过程中的技术细节、踩坑心得与解决方案，从实践中积累经验。',
  },
  {
    title: '工具探索',
    description: '整理 AI 相关工具、平台和 SDK 的使用心得，帮助快速上手。',
  },
  {
    title: '技术分享',
    description: '将开发过程中的所学所得整理成文，与社区共享技术成长。',
  },
];
```

- [ ] **步骤 10：替换底部浮动卡片内容**

找到三个浮动卡片，替换内容：

"响应速度" 卡片（`Annie Core` / `平均延迟 <200ms`）→ 改为 `开发日志` / `持续更新中`

"知识接入" 卡片（`已连接 12 个源`）→ 改为 `技术笔记` / `不断积累中`

"安全状态" 卡片（`端到端加密`）→ 改为 `开发记录` / `记录成长`

- [ ] **步骤 11：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/pages/Home.tsx
git commit -m "feat(content): 首页内容调整为个人AI开发笔记风格"
```

---

## 任务 3：Features 页文字替换

**文件：** `frontend/src/pages/Features.tsx`

- [ ] **步骤 1：替换 PageHero**

找到：
```tsx
<PageHero
  eyebrow="Features"
  title="欢迎广大网友"
  description="从对话、知识到自动化与接入能力，Annie 将 AI 能力整合为一个连续的产品体验。"
  actions={...}
/>
```
改为：
```tsx
<PageHero
  eyebrow="博客"
  title="开发笔记与技术分享"
  description="记录 AI 开发中的技术细节、工具使用与经验总结。"
  actions={...}
/>
```

- [ ] **步骤 2：替换 features 数组中各模块的 description**

将 features 数组中每个对象的 description 改为开发者笔记风格，例如：

```tsx
{
  icon: '🤖',
  title: '智能对话',
  description: '记录 AI 对话系统的开发实践，包括对话设计、流式输出与上下文管理。',
  items: ['自然语言理解', '上下文记忆', '流式响应', '多轮对话'],
},
{
  icon: '📝',
  title: '任务管理',
  description: '整理 AI 任务编排与工作流自动化的开发经验。',
  items: ['任务创建和编辑', '优先级设置', '截止日期追踪', '智能提醒'],
},
// 其他模块同样调整为开发者笔记风格描述...
```

- [ ] **步骤 3：替换底部 CTA 区块**

找到：
```tsx
<h2 className="mb-4 text-[2rem] ...">准备好开始了吗？</h2>
<p className="mb-8 ...">立即注册 Annie，开启你的 AI 助力之旅...</p>
<ButtonLink to="/register">免费注册</ButtonLink>
```
改为：
```tsx
<h2 className="mb-4 text-[2rem] ...">开始阅读笔记</h2>
<p className="mb-8 ...">浏览 AI 开发技术笔记，开启学习之旅。</p>
<ButtonLink to="/blog">阅读更多</ButtonLink>
```

- [ ] **步骤 4：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/pages/Features.tsx
git commit -m "feat(content): Features 页内容调整为博客/笔记风格"
```

---

## 任务 4：Blog 页 PageHero 替换

**文件：** `frontend/src/pages/Blog.tsx`

- [ ] **步骤 1：替换 PageHero**

找到：
```tsx
<PageHero
  eyebrow="Blog"
  title="Annie 博客与更新"
  description="这里会放 Annie 的公告、使用指南和精选教程。"
/>
```
改为：
```tsx
<PageHero
  eyebrow="博客"
  title="AI 开发笔记"
  description="个人 AI 智能体开发过程中的技术记录与心得分享。"
/>
```

- [ ] **步骤 2：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/pages/Blog.tsx
git commit -m "feat(content): Blog 页 PageHero 调整为开发笔记定位"
```

---

## 任务 5：Contact 页联系信息替换

**文件：** `frontend/src/pages/Contact.tsx`

- [ ] **步骤 1：替换 PageHero**

找到：
```tsx
<PageHero
  eyebrow="Contact"
  title="与 Annie 团队取得联系"
  description="无论是产品咨询、技术问题还是合作意向，我们随时准备帮助你。"
/>
```
改为：
```tsx
<PageHero
  eyebrow="联系"
  title="关于本站"
  description="记录 AI 开发过程中的问题和心得，欢迎交流。"
/>
```

- [ ] **步骤 2：替换联系方式卡片内容**

找到数据源：
```tsx
[
  { icon: '📧', label: '邮箱', value: 'support@annie.ai' },
  { icon: '🌐', label: '网站', value: 'https://annie.ai' },
  { icon: '💬', label: '社区', value: 'https://community.annie.ai' },
]
```
改为：
```tsx
[
  { icon: '📧', label: '邮箱', value: 'linany@linany.com' },
  { icon: '🌐', label: '网站', value: 'https://www.linany.com' },
]
```

- [ ] **步骤 3：替换底部 CTA**

找到：
```tsx
<h2 className="mb-4 ...">需要更多帮助？</h2>
<p className="mb-8 ...">查看我们的文档和常见问题...</p>
```
改为：
```tsx
<h2 className="mb-4 ...">有问题或建议？</h2>
<p className="mb-8 ...">欢迎通过上方方式联系，或浏览博客获取更多信息。</p>
```

- [ ] **步骤 4：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/pages/Contact.tsx
git commit -m "feat(content): Contact 页改为个人博客联系信息"
```

---

## 任务 6：Footer 全部文字替换

**文件：** `frontend/src/components/common/Footer.tsx`

- [ ] **步骤 1：替换 Brand 区块**

找到：
```tsx
<h3 className="mb-4 text-base font-semibold text-white">Annie AI</h3>
<p className="leading-6">
  连接知识、对话与自动化，为个人与团队提供统一的 AI 工作入口。
</p>
```
改为：
```tsx
<h3 className="mb-4 text-base font-semibold text-white">个人AI开发笔记</h3>
<p className="leading-6">
  个人 AI 开发笔记，记录技术、工具与思考。
</p>
```

- [ ] **步骤 2：替换产品链接区块**

找到：
```tsx
<h3 className="mb-4 text-base font-semibold text-white">产品</h3>
<ul className="space-y-3">
  <li><a href="/features">功能特性</a></li>
  <li><a href="/docs">开发文档</a></li>
  <li><a href="/blog">技术博客</a></li>
  <li><a href="/contact">联系我们</a></li>
</ul>
```
改为：
```tsx
<h3 className="mb-4 text-base font-semibold text-white">导航</h3>
<ul className="space-y-3">
  <li><a href="/features">博客</a></li>
  <li><a href="/docs">文档</a></li>
  <li><a href="/blog">技术笔记</a></li>
  <li><a href="/contact">关于</a></li>
</ul>
```

- [ ] **步骤 3：替换版权信息**

找到：
```tsx
<p className="mt-6 text-xs">
  Annie AI 助手 © 2024
</p>
```
改为：
```tsx
<p className="mt-6 text-xs">
  个人AI开发笔记 © 2024
</p>
```

- [ ] **步骤 4：Commit**

```bash
cd ~/projects/annie-website
git add frontend/src/components/common/Footer.tsx
git commit -m "feat(content): Footer 版权和描述替换为个人AI开发笔记"
```

---

## 验收检查

完成所有任务后验证：

- [ ] `git log --oneline` 显示 6 个新 commit
- [ ] 导航栏 Logo 显示"个人AI开发笔记"
- [ ] 首页 Hero 主标题为"记录 AI 开发，从这里开始"
- [ ] 导航栏无"对话"、"登录"、"注册"入口
- [ ] Features 页标题为"开发笔记与技术分享"
- [ ] Blog 页标题为"AI 开发笔记"
- [ ] Contact 页联系邮箱为 linany@linany.com
- [ ] Footer 版权显示"个人AI开发笔记"
- [ ] `cd frontend && npm run build` 成功无报错
