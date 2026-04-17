# Annie 首页视觉精修实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在现有首页改版基础上，将 Header、Home 和 Footer 的视觉表现提升到更强未来感和更高冲击力的版本，同时保持结构稳定与构建可用。

**架构：** 本次不再改变页面信息架构，只对现有 Tailwind token、Header、Home 和 Footer 做视觉精修。重点在 Hero 主标题、右侧视觉面板、页面 glow 层次、卡片科技感和 CTA 收束感，通过更精细的 Tailwind class 和少量主题扩展实现未来感升级。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS、Ant Design、Redux Toolkit

---

## 文件结构

### 需要修改
- `frontend/tailwind.config.ts` - 扩展更强的 glow、背景渐变、阴影与透明度 token
- `frontend/src/index.css` - 微调全局背景与基础光效层
- `frontend/src/components/common/Header.tsx` - 调整漂浮感、透明度、按钮层次、hover 亮度
- `frontend/src/components/common/Footer.tsx` - 增加更统一的精修质感与收束感
- `frontend/src/pages/Home.tsx` - 重点精修 Hero、能力卡、场景卡、CTA 区
- `frontend/src/components/common/ButtonLink.tsx` - 强化主按钮和次按钮的质感

### 需要验证
- `frontend/src/components/common/Header.tsx` 视觉层级与登录态渲染
- `frontend/src/pages/Home.tsx` Hero、能力区、场景区、CTA 区渲染
- `frontend/src/components/common/Footer.tsx` 视觉收尾表现
- `frontend` 构建结果 `npm run build`

---

### 任务 1：升级视觉 token 与全局背景光效

**文件：**
- 修改：`frontend/tailwind.config.ts`
- 修改：`frontend/src/index.css`

- [ ] **步骤 1：扩展 `tailwind.config.ts` 的 glow 与背景 token**

在现有 `extend` 中补充或增强：

```ts
boxShadow: {
  glow: '0 0 0 1px rgba(167,139,250,0.18), 0 16px 48px rgba(124,58,237,0.18)',
  'glow-lg': '0 0 0 1px rgba(167,139,250,0.24), 0 24px 80px rgba(124,58,237,0.28)',
  'cyan-glow': '0 0 0 1px rgba(34,211,238,0.16), 0 18px 56px rgba(34,211,238,0.16)',
},
backgroundImage: {
  'annie-radial': 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 38%)',
  'annie-hero': 'radial-gradient(circle at 20% 0%, rgba(124,58,237,0.24), transparent 30%), radial-gradient(circle at 80% 10%, rgba(34,211,238,0.18), transparent 28%)',
  'annie-grid': 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
},
```

确保保留现有 `annie.*` 颜色 token，不重命名已有键。

- [ ] **步骤 2：精修 `src/index.css` 的页面背景层次**

将 `body` 背景替换成更具空间感的版本，例如：

```css
body {
  margin: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(124, 58, 237, 0.18), transparent 28%),
    radial-gradient(circle at 80% 10%, rgba(34, 211, 238, 0.12), transparent 24%),
    linear-gradient(180deg, #11162a 0%, #0b1020 55%, #090d18 100%);
  color: #f8fafc;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent 75%);
  opacity: 0.35;
}
```

如果担心 `body::before` 影响交互，必须保留 `pointer-events: none`。

- [ ] **步骤 3：运行构建验证全局样式改动通过**

运行：`cd frontend && npm run build`
预期：PASS，无 Tailwind 配置错误

- [ ] **步骤 4：Commit**

```bash
git add frontend/tailwind.config.ts frontend/src/index.css
git commit -m "feat: enhance visual tokens and global glow layers"
```

### 任务 2：精修按钮与 Header 浮层感

**文件：**
- 修改：`frontend/src/components/common/ButtonLink.tsx`
- 修改：`frontend/src/components/common/Header.tsx`

- [ ] **步骤 1：升级 `ButtonLink.tsx` 的主次按钮视觉**

将主按钮样式加强为更明显的渐变与 glow，次按钮改成玻璃感风格，例如：

```tsx
const variantClass = {
  primary:
    'bg-gradient-to-r from-annie-purple via-violet-500 to-annie-lavender text-white shadow-glow-lg hover:-translate-y-0.5 hover:brightness-110',
  secondary:
    'border border-white/15 bg-white/8 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/12',
};
```

确保仍保留 `primary | secondary` API，不改调用方接口。

- [ ] **步骤 2：让 Header 更轻、更浮、更透明**

在 `Header.tsx` 中微调外层导航条类名，目标接近：

```tsx
<div className="mx-auto flex max-w-8xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
```

并让导航链接使用更弱默认态与更亮 hover 态：

```tsx
className="text-sm text-white/65 transition duration-200 hover:text-white"
```

- [ ] **步骤 3：精修 Header 右侧操作按钮层次**

规则：
- 登录态用户名按钮更像轻玻璃按钮
- 未登录态“登录”为弱按钮
- “注册”为更强主按钮

避免 Header 右侧比 Hero CTA 更抢。

- [ ] **步骤 4：运行构建验证 Header 与按钮改动通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/ButtonLink.tsx frontend/src/components/common/Header.tsx
git commit -m "feat: polish header and button visuals"
```

### 任务 3：重做 Hero 标题张力与右侧未来感面板

**文件：**
- 修改：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：精修 Hero 标题层级与文案排版**

将 Hero 标题改成更紧凑、更有力量的写法，样式接近：

```tsx
<h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
  让 <span className="bg-gradient-to-r from-white via-annie-lavender to-annie-cyan bg-clip-text text-transparent">Annie</span>
  <br />
  成为你的智能协作中枢
</h1>
```

副标题改为更短、更像产品定义句：

```tsx
<p className="max-w-2xl text-base leading-7 text-white/70 md:text-lg">
  连接知识、对话与自动化能力，为个人、团队与开发者提供统一的 AI 工作入口。
</p>
```

- [ ] **步骤 2：增强 Hero 区容器背景和空间感**

Hero 外层区块增加更明显的 glow 与光斑承接，例如：

```tsx
<Section className="relative overflow-hidden pt-14 md:pt-24">
  <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-annie-hero blur-3xl" />
  {/* Hero content */}
</Section>
```

- [ ] **步骤 3：将右侧视觉区改成“主面板 + 漂浮卡片”结构**

目标结构：
- 一个大主面板
- 左上或右上 1 张浮卡
- 底部再叠 1 到 2 张轻量卡

建议主面板类名接近：

```tsx
<div className="relative mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow-lg backdrop-blur-xl">
```

主面板中至少包含：
- 一个顶部状态栏样式块
- 2 到 3 个能力条目块
- 一个强调色高亮区域

浮层卡片中至少表达：
- 智能对话
- 知识支持
- 自动化执行

- [ ] **步骤 4：让 CTA 与 Hero 视觉形成更明确主次**

要求：
- CTA 与标题距离更舒展
- 主按钮更明显
- 次按钮不再只是普通 outline

整体按钮区域类名建议：

```tsx
<div className="flex flex-wrap gap-4 pt-2">
```

- [ ] **步骤 5：运行构建验证 Hero 精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 6：Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: strengthen homepage hero visual impact"
```

### 任务 4：精修能力卡与场景卡的科技面板感

**文件：**
- 修改：`frontend/src/pages/Home.tsx`

- [ ] **步骤 1：升级能力卡的边框、hover 与装饰元素**

将能力卡类名升级为更像科技面板：

```tsx
className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-cyan-glow"
```

每张卡顶部加入一个小圆点或图标容器，例如：

```tsx
<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-annie-cyan">
  01
</div>
```

- [ ] **步骤 2：提升场景卡的尺寸、留白与高级感**

场景卡不只是普通说明块，类名应更接近：

```tsx
className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-glow transition duration-300 hover:-translate-y-1"
```

文案层级：
- 标题更大
- 描述更少
- 留白更充分

- [ ] **步骤 3：为区块标题增加更明确的 section 气质**

核心能力区和场景区标题都补充更统一的 eyebrow + 标题 + 描述结构，例如：

```tsx
<span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
  Capabilities
</span>
```

避免 section 开头过于平淡。

- [ ] **步骤 4：运行构建验证卡片精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: polish homepage capability and scenario cards"
```

### 任务 5：精修 CTA 收尾区与 Footer 收束感

**文件：**
- 修改：`frontend/src/pages/Home.tsx`
- 修改：`frontend/src/components/common/Footer.tsx`

- [ ] **步骤 1：将底部 CTA 区升级为“能量块”式收尾**

把 CTA 容器改成更聚焦的高亮块，例如：

```tsx
<div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] px-8 py-14 text-center shadow-glow-lg">
  <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-annie-lavender/20 blur-3xl" />
  {/* CTA content */}
</div>
```

标题更有号召力，按钮更有重量。

- [ ] **步骤 2：让 Footer 更像页面视觉的自然收口**

保留三栏结构，但：
- 弱化分栏割裂感
- 增加更轻的顶部边界
- 文本层级更柔和
- 品牌描述更短，更像结束语

类名可往这个方向调整：

```tsx
<footer className="relative border-t border-white/8 bg-black/20">
```

- [ ] **步骤 3：确保 Footer 不抢 CTA 的注意力**

Footer 的颜色和对比度必须明显弱于 CTA 区，不能让页面结尾出现两个视觉中心。

- [ ] **步骤 4：运行构建验证 CTA 与 Footer 精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/components/common/Footer.tsx
git commit -m "feat: refine homepage closing section and footer"
```

### 任务 6：最终验证与范围确认

**文件：**
- 验证：`frontend`

- [ ] **步骤 1：运行最终前端构建**

运行：`cd frontend && npm run build`
预期：PASS；若仍有 chunk size warning，可记录但不视为失败

- [ ] **步骤 2：检查变更范围集中在计划内文件**

运行：`cd /Users/yanlin/projects/annie-website && git diff --stat HEAD~5..HEAD`
预期：变更集中在 `Home`、`Header`、`Footer`、`ButtonLink`、`tailwind.config.ts`、`index.css`

- [ ] **步骤 3：如本机具备 Docker，则验证前端镜像可构建**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS

若本机无 Docker，明确记录跳过原因，不伪称完成。

- [ ] **步骤 4：Commit 最终整理（仅在有新文件变更时）**

```bash
git add frontend
git commit -m "chore: finalize homepage visual polish verification"
```

仅当验证或收尾产生实际改动时执行。

---

## 自检结果

### 规格覆盖度
- Header 精修：任务 2
- Hero 精修：任务 3
- 背景和 glow：任务 1、3
- 能力卡与场景卡科技感：任务 4
- CTA 与 Footer 收束感：任务 5
- 构建与范围验证：任务 6

### 占位符扫描
- 无 “TODO”“待定”“后续实现” 等占位语
- 每个任务均含精确文件、命令和目标代码样式

### 类型一致性
- 沿用现有 `ButtonLink`、`Header`、`Footer`、`Home` 组件命名
- 继续使用 `annie.*` Tailwind token 命名空间
- 不引入新的页面组件 API 变更
