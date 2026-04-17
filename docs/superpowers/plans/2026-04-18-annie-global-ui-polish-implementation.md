# Annie 全站 UI 质感精修实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在现有整站统一基础上，通过放大标题系统、增强文字对比度、拉开卡片层级和提升页面气场，让 Annie 全站前台视觉整体再提升一档。

**架构：** 本次不改页面结构，重点围绕全站标题系统、文字层级、卡片质感和表单页聚焦感做横向精修。先调整公共标题/卡片原语，再分别修正 Home、Features、Docs、Blog、Contact、Login、Register 的具体页面表现，最后做统一性验证。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS、Ant Design、React Router、Redux Toolkit、Axios

---

## 文件结构

### 需要修改
- `frontend/src/components/common/PageHero.tsx` - 统一放大页面主标题与描述层级
- `frontend/src/components/common/GlassCard.tsx` - 统一卡片边框、背景和视觉个性
- `frontend/src/components/common/AuthShell.tsx` - 提升表单页标题与中心聚焦感
- `frontend/src/pages/Home.tsx` - 放大首页 section 标题，强化卡片标题与正文层级
- `frontend/src/pages/Features.tsx` - 强化能力展示页的标题系统和卡片辨识度
- `frontend/src/pages/Docs.tsx` - 修正文字对比和分类卡可读性
- `frontend/src/pages/Blog.tsx` - 强化文章卡标题与摘要层级
- `frontend/src/pages/Contact.tsx` - 提升联系入口卡片辨识度
- `frontend/src/pages/Auth/Login.tsx` - 放大标题与表单层级，增强可读性
- `frontend/src/pages/Auth/Register.tsx` - 同 Login
- 可选：`frontend/src/index.css` - 若确有必要补充统一文本辅助类

### 需要验证
- `frontend` 构建结果 `npm run build`
- Home / Features / Docs / Blog / Contact / Login / Register 页面标题、卡片与文本层级

---

### 任务 1：提升全站公共标题系统与卡片原语

**文件：**
- 修改：`frontend/src/components/common/PageHero.tsx`
- 修改：`frontend/src/components/common/GlassCard.tsx`
- 修改：`frontend/src/components/common/AuthShell.tsx`

- [ ] **步骤 1：放大 `PageHero.tsx` 的主标题与描述层级**

将当前 `PageHero` 标题从保守尺寸提升为更有产品官网气场的版本，例如：

```tsx
<h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-white md:text-7xl">
  {title}
</h1>
<p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-xl">
  {description}
</p>
```

确保：
- 标题比当前版本明显更大
- 描述与标题层级拉开
- 文字不发灰

- [ ] **步骤 2：让 `GlassCard.tsx` 更有风格，而不只是统一壳子**

将基础卡片样式升级为更明确的“深色高质感卡片”，例如：

```tsx
<div className={`rounded-[2rem] border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-glow backdrop-blur-xl ${className}`}>
  {children}
</div>
```

如需进一步增强个性，可为卡片顶部补充轻微内高光或边框变化，但不要引入复杂伪元素抽象。

- [ ] **步骤 3：放大 `AuthShell.tsx` 标题并强化中心聚焦**

将标题与描述提升为更像产品入口页，例如：

```tsx
<h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white md:text-5xl">{title}</h1>
<p className="mt-4 text-sm leading-7 text-white/68 md:text-base">{description}</p>
```

同时确保外层卡片不会因为标题变大而显得拥挤，必要时增加 `p-10 md:p-12`。

- [ ] **步骤 4：运行构建验证公共原语提升通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/PageHero.tsx frontend/src/components/common/GlassCard.tsx frontend/src/components/common/AuthShell.tsx
git commit -m "feat: strengthen shared page titles and card styling"
```

### 任务 2：精修 Home 与 Features 的标题系统和展示卡片

**文件：**
- 修改：`frontend/src/pages/Home.tsx`
- 修改：`frontend/src/pages/Features.tsx`

- [ ] **步骤 1：放大 Home 各 section 标题并拉开与正文的层级**

重点调整：
- `核心能力`
- `使用场景`
- 底部 CTA 标题

将 section 标题统一提升到例如：

```tsx
<h2 className="mb-4 mt-4 text-4xl font-semibold tracking-[-0.02em] text-white md:text-5xl">
  核心能力
</h2>
```

正文说明提升到：

```tsx
<p className="mx-auto max-w-2xl text-base leading-8 text-white/70 md:text-lg">
```

- [ ] **步骤 2：加强 Home 卡片标题与描述层级**

对于能力卡和场景卡：
- 标题更大、更白
- 描述提升对比度

例如：

```tsx
<h3 className="mb-3 text-xl font-semibold text-white">{capability.title}</h3>
<p className="text-sm leading-7 text-white/70">{capability.description}</p>
```

- [ ] **步骤 3：精修 `Features.tsx`，避免功能卡“字和背景黏在一起”**

要求：
- 页面主标题更大
- 功能卡标题更明显
- 描述文字对比度提升
- 若当前所有功能卡过于同质，可通过顶部编号、色点或区块头区分层次

对功能卡优先做到：

```tsx
<h3 className="mb-3 text-xl font-semibold text-white">...</h3>
<p className="text-sm leading-7 text-white/72">...</p>
```

- [ ] **步骤 4：运行构建验证 Home / Features 精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/pages/Features.tsx
git commit -m "feat: improve homepage and feature page readability"
```

### 任务 3：精修 Docs 与 Blog 的可读性与内容卡层级

**文件：**
- 修改：`frontend/src/pages/Docs.tsx`
- 修改：`frontend/src/pages/Blog.tsx`

- [ ] **步骤 1：提升 `Docs.tsx` 的页面主标题、搜索区与分类卡层级**

重点：
- 页面标题放大
- 搜索卡标题或搜索区描述更明确
- 文档分类卡标题更突出
- 分类说明更好读

避免出现“页面有风格，但内容入口不清晰”的问题。

- [ ] **步骤 2：提升 `Blog.tsx` 中文章卡的标题锚点与摘要可读性**

要求：
- 文章标题明显更大、更白
- 摘要与标题拉开
- 标签区不抢标题

目标结构例如：

```tsx
<h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">{item.title}</h3>
<Paragraph className="mt-3 text-sm leading-7 text-white/70">...</Paragraph>
```

- [ ] **步骤 3：统一 Docs / Blog 的空状态与加载态文字对比**

如果当前 `Empty` / `Spin` 周围文案过弱，增强其标题与说明的可读性，避免深色背景下弱化过度。

- [ ] **步骤 4：运行构建验证 Docs / Blog 精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Docs.tsx frontend/src/pages/Blog.tsx
git commit -m "feat: enhance docs and blog hierarchy and contrast"
```

### 任务 4：精修 Contact 与 Auth 页的标题和聚焦感

**文件：**
- 修改：`frontend/src/pages/Contact.tsx`
- 修改：`frontend/src/pages/Auth/Login.tsx`
- 修改：`frontend/src/pages/Auth/Register.tsx`

- [ ] **步骤 1：提升 `Contact.tsx` 的标题与联系入口卡片清晰度**

要求：
- 页面主标题更有气场
- 联系方式卡片标题更清楚
- 辅助说明不发灰到看不清
- 如果页面含表单，表单区标题与说明也需要更明确

- [ ] **步骤 2：提升 `Login.tsx` 与 `Register.tsx` 的入口感**

要求：
- 标题更大
- 描述与输入框区的距离更合理
- 表单卡内部层级更像产品入口页，不像普通默认表单
- 切换登录/注册的辅助链接清晰但不抢主标题

- [ ] **步骤 3：统一表单文字、label、辅助说明和按钮的层级**

重点修正：
- label 不能太弱
- 按钮必须清晰成为主 CTA
- 提示文字不能和背景糊在一起

- [ ] **步骤 4：运行构建验证 Contact / Auth 页精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Contact.tsx frontend/src/pages/Auth/Login.tsx frontend/src/pages/Auth/Register.tsx
git commit -m "feat: refine contact and auth page hierarchy"
```

### 任务 5：全站统一性验证与收尾

**文件：**
- 可选：`frontend/src/index.css`
- 验证：`frontend`

- [ ] **步骤 1：通读全站前台页面，确认标题系统整体上提**

检查点：
- 页面主标题显著更大
- section 标题不再保守
- 卡片标题和正文明显分层
- 表单页标题具备入口感

如果个别页面仍显得偏小，优先补页面级类名，而不是引入新的复杂抽象。

- [ ] **步骤 2：通读卡片，确认文字与背景对比足够**

重点检查：
- Features 卡片
- Docs 分类卡
- Blog 文章卡
- Home 能力/场景卡
- Contact 信息卡

若某些页面仍有“字糊在背景里”的问题，直接提升文字亮度、字重或背景深浅差异。

- [ ] **步骤 3：运行最终前端构建**

运行：`cd frontend && npm run build`
预期：PASS；chunk size warning 可接受，但不得有编译错误

- [ ] **步骤 4：如本机具备 Docker，验证前端镜像仍可构建**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS

若 Docker 不可用，明确记录跳过原因。

- [ ] **步骤 5：检查改动范围聚焦于前台 UI 质感修正**

运行：`cd /Users/yanlin/projects/annie-website && git diff --stat HEAD~5..HEAD`
预期：主要变化集中在公共页面原语和前台页面视图组件

- [ ] **步骤 6：Commit 最终整理（仅在有新改动时）**

```bash
git add frontend/src/components/common frontend/src/pages frontend/src/index.css
git commit -m "chore: finalize global UI polish verification"
```

仅当验证步骤产生实际修改时执行。

---

## 自检结果

### 规格覆盖度
- 标题系统放大：任务 1、2、3、4
- 文字对比与可读性：任务 2、3、4、5
- 卡片风格提升：任务 1、2、3、4
- Home 也纳入精修：任务 2
- 全站统一性验证：任务 5

### 占位符扫描
- 无 “TODO”“待定”“后续实现” 等占位语
- 每个任务均包含明确文件、调整目标与验证命令

### 类型一致性
- 继续沿用 `PageHero`、`GlassCard`、`AuthShell` 作为公共原语
- 不改路由与数据逻辑
- 所有精修都围绕现有前台骨架进行，不扩散结构范围
