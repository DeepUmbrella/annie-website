# Annie Hero 主视觉面板精修实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在不改变首页整体结构的前提下，显著强化 Hero 第一屏的右侧 AI 主视觉面板，让 Annie 首页更像一个正在运行的 AI 产品主界面。

**架构：** 本次只改 `Home.tsx` 中 Hero 区域，必要时微调 Hero 相关按钮的视觉权重，但不触碰 Header、Footer 或下方 section。实现重点是右侧主控制面板、漂浮子模块、局部 glow 和主面板内部结构层次，使 Hero 的视觉中心从“标题”升级为“右侧 AI 系统面板”。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS

---

## 文件结构

### 需要修改
- `frontend/src/pages/Home.tsx` - Hero 左侧标题/CTA 微调与右侧主视觉面板重构
- `frontend/src/components/common/ButtonLink.tsx` - 仅当 Hero CTA 需要更强能量感时做极小范围调整

### 需要验证
- `frontend/src/pages/Home.tsx` Hero 第一屏渲染与布局
- `frontend` 构建结果 `npm run build`

---

### 任务 1：增强 Hero 左侧标题与 CTA，但保持辅助定位

**文件：**
- 修改：`frontend/src/pages/Home.tsx`
- 可选修改：`frontend/src/components/common/ButtonLink.tsx`

- [ ] **步骤 1：加强 Hero 标题的压迫感，但不让其压过右侧面板**

在 `Home.tsx` 中将 Hero 标题微调为更紧凑、更有张力的版本，例如：

```tsx
<h1 className="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.04em] text-white md:text-7xl xl:text-[5.4rem]">
  让 <span className="bg-gradient-to-r from-white via-annie-lavender to-annie-cyan bg-clip-text text-transparent">Annie</span>
  <br />
  成为你的智能协作中枢
</h1>
```

保留当前文案主旨，不扩写新的长标题。

- [ ] **步骤 2：精修副标题为更像产品定义句的承接文案**

副标题目标样式：

```tsx
<p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
  连接知识、对话与自动化能力，为个人、团队与开发者提供统一的 AI 工作入口。
</p>
```

如果当前文案已经足够短，可仅微调类名，不必重写内容。

- [ ] **步骤 3：增强 CTA 的能量感，但保持其辅助角色**

按钮区目标：
- 主按钮更亮
- 次按钮玻璃感更强
- 间距更舒展

可通过在 `ButtonLink.tsx` 中将主按钮增强为：

```tsx
primary:
  'bg-gradient-to-r from-annie-purple via-fuchsia-500 to-annie-cyan text-white shadow-glow-lg hover:-translate-y-0.5 hover:brightness-110',
```

仅当实际页面需要时才修改 `ButtonLink.tsx`。

- [ ] **步骤 4：运行构建验证 Hero 左侧与 CTA 调整通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/components/common/ButtonLink.tsx
git commit -m "feat: strengthen hero headline and CTA energy"
```

仅当 `ButtonLink.tsx` 实际发生修改时才加入 commit。

### 任务 2：把右侧视觉区改成更强的主控制面板

**文件：**
- 修改：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：增大 Hero 右侧主面板尺寸并提高视觉权重**

将当前主面板提升为更大、更像核心界面的容器，例如：

```tsx
<div className="relative mx-auto w-full max-w-2xl rounded-[2.25rem] border border-white/12 bg-white/[0.05] p-6 shadow-glow-lg backdrop-blur-2xl xl:p-7">
```

目标是让右侧主面板明显成为第一屏视觉中心。

- [ ] **步骤 2：重构主面板内部为更像 AI 控制台的分层结构**

主面板至少包含以下层次：
- 顶部状态栏
- 主工作区摘要
- 2 到 3 个能力模块块
- 一条强调色状态条或任务区域

建议结构类似：

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-annie-cyan" />
      <span className="text-sm font-medium text-white">Annie Core</span>
    </div>
    <span className="rounded-full border border-annie-cyan/20 bg-annie-cyan/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-annie-cyan">
      Online
    </span>
  </div>
  {/* 更多模块 */}
</div>
```

- [ ] **步骤 3：增加更像“系统在线”的细节元素**

在面板内部加入以下轻量元素中的若干项：
- `Online`
- `Indexed`
- `Secure`
- `Workflow Ready`
- `Knowledge Synced`

表现方式以状态标签、小型信息块、辅助说明为主，不使用复杂图表。

- [ ] **步骤 4：运行构建验证主面板重构通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: redesign hero into stronger AI control panel"
```

### 任务 3：加入漂浮子模块，形成“主系统 + 子能力”层级

**文件：**
- 修改：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：将现有右侧浮卡扩展为 2 到 4 个错位子模块**

围绕主面板布置子模块，类型建议从以下中挑选：
- 知识接入
- 工作流节点
- 响应速度
- 安全状态

每个子模块使用不完全对称的位置，例如：
- 左上或左下一个较小模块
- 右上或右中一个状态模块
- 底部一个较宽模块

- [ ] **步骤 2：让子模块在大小、位置、颜色上形成层次差异**

示例类名方向：

```tsx
<div className="absolute -left-8 top-16 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-glow backdrop-blur-xl">
```

```tsx
<div className="absolute -right-6 bottom-12 w-52 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-cyan-glow backdrop-blur-xl">
```

要求：
- 不等宽
- 不等高
- 不做机械对称
- 不盖住主面板核心内容

- [ ] **步骤 3：给子模块增加“能力模块”而非“装饰卡”的内容**

每个模块至少包含：
- 一个状态点 / 图标
- 一条短标题
- 一条短辅助说明或状态标签

避免只有 emoji + 一句话的浅层视觉。

- [ ] **步骤 4：运行构建验证漂浮模块改动通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: add layered floating modules to hero panel"
```

### 任务 4：让 Hero 背景与光效聚焦服务右侧主视觉

**文件：**
- 修改：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：把 Hero glow 聚焦到右侧主视觉区域**

在 Hero 区中，为右侧面板增加更聚焦的局部 glow，例如：

```tsx
<div className="absolute right-0 top-8 -z-10 h-[420px] w-[420px] rounded-full bg-annie-purple/20 blur-[120px]" />
<div className="absolute right-24 top-32 -z-10 h-[220px] w-[220px] rounded-full bg-annie-cyan/12 blur-[100px]" />
```

不要增强整页其他区块的 glow。

- [ ] **步骤 2：让 Hero 背景和主面板产生空间关系**

可通过：
- 面板后方局部光场
- 背景轻网格或分层面片
- 面板容器前后景深差异

但必须保持简洁，不引入复杂 CSS 动画。

- [ ] **步骤 3：运行构建验证 Hero 背景精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 4：Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: focus hero glow around main visual panel"
```

### 任务 5：最终验证 Hero 是否成为第一屏主视觉中心

**文件：**
- 验证：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：通读 Hero JSX，确认视觉中心已转到右侧面板**

检查标准：
- 标题依然强，但不再独占视觉中心
- 右侧主面板明显比左侧更具“系统感”
- 子模块帮助建立主系统 + 子能力的层级
- 整体看起来更像 AI 产品主界面

如果仍像“右边几张卡片”，继续增强主面板内部结构，而不是再堆光效。

- [ ] **步骤 2：运行最终前端构建**

运行：`cd frontend && npm run build`
预期：PASS；chunk size warning 可接受，但不得有编译错误

- [ ] **步骤 3：如本机具备 Docker，验证前端镜像可构建**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS

若 Docker 不可用，明确记录跳过原因。

- [ ] **步骤 4：Commit 最终整理（仅在验证中产生新改动时）**

```bash
git add frontend/src/pages/Home.tsx frontend/src/components/common/ButtonLink.tsx
git commit -m "chore: finalize hero panel polish verification"
```

仅当验证步骤带来实际文件改动时执行。

---

## 自检结果

### 规格覆盖度
- 左侧标题/CTA增强：任务 1
- 主控制面板重构：任务 2
- 漂浮子模块层级：任务 3
- 背景 glow 聚焦：任务 4
- 最终视觉中心验证：任务 5

### 占位符扫描
- 无 “TODO”“待定”“后续实现” 等占位语
- 每个任务都有明确文件、类名方向与验证命令

### 类型一致性
- 保持 `Home.tsx` 为唯一核心修改点
- 不更改 Hero 之外的页面 API
- `ButtonLink` 仅在确有必要时小幅调整，不扩散组件职责
