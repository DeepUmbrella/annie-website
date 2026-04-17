# Annie 全站前台统一实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 Annie 全站前台页面统一到现有首页建立的强视觉 AI 产品官网语言中，包括 Features、Docs、Blog、Contact、Login、Register，以及支撑这些页面的公共页面骨架。

**架构：** 本次先统一公共页面原语，再按页面分型逐步改造营销展示页、内容信息页和表单转化页。Header、Footer 和首页保持当前方向，新增可复用的页面 Hero/section/empty-state/form-shell 模式，然后将各页面逐一纳入统一风格，保证整站连续体验。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS、Ant Design、Redux Toolkit、React Router、Axios

---

## 文件结构

### 需要创建
- `frontend/src/components/common/PageHero.tsx` - 通用页面 Hero 组件，统一 eyebrow / title / description 结构
- `frontend/src/components/common/GlassCard.tsx` - 通用深色玻璃卡片容器
- `frontend/src/components/common/AuthShell.tsx` - Login / Register 共享的转化页外壳

### 需要修改
- `frontend/src/pages/Features.tsx` - 改造成产品能力展示页
- `frontend/src/pages/Docs.tsx` - 改造成开发者文档入口页
- `frontend/src/pages/Blog.tsx` - 改造成产品博客/更新页
- `frontend/src/pages/Contact.tsx` - 改造成现代产品联系页
- `frontend/src/pages/Auth/Login.tsx` - 改造成深色高质感转化页
- `frontend/src/pages/Auth/Register.tsx` - 改造成深色高质感转化页
- `frontend/src/index.css` - 若有必要补充全站公共辅助类
- `frontend/src/App.tsx` - 仅在需要时微调整体页面壳层，不改路由结构

### 需要验证
- `frontend` 构建结果 `npm run build`
- 前台页面渲染：Features / Docs / Blog / Contact / Login / Register
- 变更范围集中于前台页面与公共原语

---

### 任务 1：建立整站统一页面原语

**文件：**
- 创建：`frontend/src/components/common/PageHero.tsx`
- 创建：`frontend/src/components/common/GlassCard.tsx`
- 创建：`frontend/src/components/common/AuthShell.tsx`
- 可选修改：`frontend/src/index.css`

- [ ] **步骤 1：创建 `PageHero.tsx` 统一页面 Hero 结构**

写入：

```tsx
import type { ReactNode } from 'react';
import Section from './Section';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

const PageHero = ({ eyebrow, title, description, actions }: PageHeroProps) => {
  return (
    <Section className="pt-12 md:pt-20">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
          {description}
        </p>
        {actions ? <div className="mt-8 flex flex-wrap justify-center gap-4">{actions}</div> : null}
      </div>
    </Section>
  );
};

export default PageHero;
```

- [ ] **步骤 2：创建 `GlassCard.tsx` 封装统一玻璃卡片风格**

写入：

```tsx
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard = ({ children, className = '' }: GlassCardProps) => {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-glow backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
```

- [ ] **步骤 3：创建 `AuthShell.tsx` 作为登录注册页共享壳层**

写入：

```tsx
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

const AuthShell = ({ title, description, children }: AuthShellProps) => {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-annie-hero opacity-70 blur-3xl" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-glow-lg backdrop-blur-2xl md:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-annie-cyan">Annie AI</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthShell;
```

- [ ] **步骤 4：运行构建验证公共原语可用**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/PageHero.tsx frontend/src/components/common/GlassCard.tsx frontend/src/components/common/AuthShell.tsx frontend/src/index.css
git commit -m "feat: add shared frontend page primitives"
```

若 `index.css` 未改动，则不加入 commit。

### 任务 2：统一 Features 与 Contact 为营销展示页

**文件：**
- 修改：`frontend/src/pages/Features.tsx`
- 修改：`frontend/src/pages/Contact.tsx`
- 依赖：`frontend/src/components/common/PageHero.tsx`
- 依赖：`frontend/src/components/common/GlassCard.tsx`
- 依赖：`frontend/src/components/common/ButtonLink.tsx`

- [ ] **步骤 1：将 `Features.tsx` 改造成产品能力展示页**

目标结构：
- `PageHero`
- 核心功能卡网格
- 一段优势说明或能力亮点区
- 底部 CTA

至少使用：

```tsx
<PageHero
  eyebrow="Features"
  title="围绕 Annie 构建更统一的 AI 工作体验"
  description="从对话、知识到自动化与接入能力，Annie 将 AI 能力整合为一个连续的产品体验。"
  actions={
    <>
      <ButtonLink to="/register">立即体验</ButtonLink>
      <ButtonLink to="/docs" variant="secondary">查看文档</ButtonLink>
    </>
  }
/>
```

- [ ] **步骤 2：将 `Contact.tsx` 改造成现代产品联系页**

目标结构：
- `PageHero`
- 联系方式卡片区
- 表单或联系入口卡片
- 辅助 CTA

避免传统企业站式排版，优先使用 `GlassCard` 承载联系信息。

- [ ] **步骤 3：运行构建验证营销展示页改版通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 4：Commit**

```bash
git add frontend/src/pages/Features.tsx frontend/src/pages/Contact.tsx
git commit -m "feat: unify feature and contact pages with landing style"
```

### 任务 3：统一 Docs 与 Blog 为内容信息页

**文件：**
- 修改：`frontend/src/pages/Docs.tsx`
- 修改：`frontend/src/pages/Blog.tsx`
- 依赖：`frontend/src/components/common/PageHero.tsx`
- 依赖：`frontend/src/components/common/GlassCard.tsx`

- [ ] **步骤 1：将 `Docs.tsx` 改造成开发者文档入口页**

目标结构：
- `PageHero`
- 搜索区卡片
- 文档分类卡片区
- 搜索结果保持现有逻辑，但外观切换到 `GlassCard`

搜索输入区域可嵌入：

```tsx
<GlassCard className="p-6 md:p-8">
  <Input.Search ... />
</GlassCard>
```

- [ ] **步骤 2：将 `Blog.tsx` 改造成产品博客/更新页风格**

目标结构：
- `PageHero`
- 博客卡片列表
- 空状态更高级
- 保持内容可读性优先

现有列表与加载逻辑保留，视觉层统一到深色卡片体系。

- [ ] **步骤 3：统一内容页空状态、加载态与列表容器风格**

要求：
- `Spin` 周围容器更有页面感
- `Empty` 不再是裸展示
- 列表卡片与首页语言统一

- [ ] **步骤 4：运行构建验证内容信息页改版通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Docs.tsx frontend/src/pages/Blog.tsx
git commit -m "feat: unify docs and blog pages with content page style"
```

### 任务 4：统一 Login 与 Register 为强视觉转化页

**文件：**
- 修改：`frontend/src/pages/Auth/Login.tsx`
- 修改：`frontend/src/pages/Auth/Register.tsx`
- 依赖：`frontend/src/components/common/AuthShell.tsx`

- [ ] **步骤 1：将 `Login.tsx` 改造成深色转化页**

使用 `AuthShell` 包裹表单，保留现有逻辑，替换页面结构为：

```tsx
<AuthShell
  title="欢迎回来"
  description="继续使用 Annie，连接你的知识、协作与自动化工作流。"
>
  {/* 原表单 */}
</AuthShell>
```

表单内按钮与输入框样式需适配深色背景，避免与默认 Ant Design 亮色样式冲突。

- [ ] **步骤 2：将 `Register.tsx` 改造成同一套转化页**

同样使用 `AuthShell`，标题可为：

```tsx
<AuthShell
  title="开始使用 Annie"
  description="创建账号，进入统一的 AI 产品体验。"
>
```

- [ ] **步骤 3：统一 Login / Register 的输入框、按钮与辅助链接层级**

要求：
- 标题/描述/表单/切换链接层级清晰
- 按钮风格与整站 CTA 保持一致
- 辅助链接不显得像默认表单页

- [ ] **步骤 4：运行构建验证表单页改版通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Auth/Login.tsx frontend/src/pages/Auth/Register.tsx frontend/src/components/common/AuthShell.tsx
git commit -m "feat: unify auth pages with premium conversion layout"
```

### 任务 5：整站细节统一与收尾

**文件：**
- 可选修改：`frontend/src/App.tsx`
- 可选修改：`frontend/src/index.css`
- 验证：`frontend`

- [ ] **步骤 1：检查所有前台页的 section 节奏是否统一**

检查点：
- Hero 到正文的间距
- 页面宽度
- 标题层级
- CTA 风格
- 卡片圆角、边框、背景透明度

如发现明显断层，可在 `App.tsx` 或 `index.css` 中做最小级别修补，不重构路由或页面结构。

- [ ] **步骤 2：运行最终前端构建**

运行：`cd frontend && npm run build`
预期：PASS；chunk size warning 可接受，但不得有编译错误

- [ ] **步骤 3：如本机具备 Docker，验证前端镜像可构建**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS

若 Docker 不可用，明确记录跳过原因。

- [ ] **步骤 4：检查改动范围集中于前台页面与公共原语**

运行：`cd /Users/yanlin/projects/annie-website && git diff --stat HEAD~5..HEAD`
预期：主要变更集中在：
- `src/pages/Features.tsx`
- `src/pages/Docs.tsx`
- `src/pages/Blog.tsx`
- `src/pages/Contact.tsx`
- `src/pages/Auth/Login.tsx`
- `src/pages/Auth/Register.tsx`
- 新增公共原语组件

- [ ] **步骤 5：Commit 最终整理（仅在有新改动时）**

```bash
git add frontend/src/App.tsx frontend/src/index.css frontend/src/pages frontend/src/components/common
git commit -m "chore: finalize frontend page unification verification"
```

仅当验证步骤带来实际文件改动时执行。

---

## 自检结果

### 规格覆盖度
- 整站页面骨架：任务 1
- Features / Contact：任务 2
- Docs / Blog：任务 3
- Login / Register：任务 4
- 全站统一性与验证：任务 5

### 占位符扫描
- 无 “TODO”“待定”“后续实现” 等占位语
- 每个任务均含明确文件、结构目标与验证命令

### 类型一致性
- 统一通过 `PageHero`、`GlassCard`、`AuthShell` 这 3 个公共原语建立骨架
- 不更改既有路由与数据请求逻辑
- 页面分类与样式职责清晰分离
