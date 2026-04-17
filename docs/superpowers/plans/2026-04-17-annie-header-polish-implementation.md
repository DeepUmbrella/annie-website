# Annie Header 精修实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 小范围精修 Annie 公共 Header，让品牌更明显、导航更大气、右侧登录区更像独立操作区，同时保持当前未来感与构建可用。

**架构：** 本次只修改 Header，必要时小幅调整其依赖的按钮样式，但不扩散到 Home 和 Footer。通过 Tailwind class 精调字号、间距、对齐方式与右侧操作区布局来提升 Header 的整体平衡与气场。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS、React Router、Redux Toolkit

---

## 文件结构

### 需要修改
- `frontend/src/components/common/Header.tsx` - Header 品牌、导航与右侧操作区精修
- `frontend/src/components/common/ButtonLink.tsx` - 仅当 Header 需要共享更一致按钮质感时才小幅调整

### 需要验证
- `frontend/src/components/common/Header.tsx` 桌面端布局与对齐
- `frontend` 构建结果 `npm run build`

---

### 任务 1：放大品牌锚点并增强左侧识别度

**文件：**
- 修改：`frontend/src/components/common/Header.tsx`

- [ ] **步骤 1：提升品牌文字的字号与字重**

将当前品牌链接从类似：

```tsx
<Link to="/" className="text-lg font-semibold tracking-tight text-white">
  Annie AI
</Link>
```

调整为更有锚点感的版本，例如：

```tsx
<Link to="/" className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
  Annie AI
</Link>
```

保留纯文本品牌，不新增复杂 logo 图形。

- [ ] **步骤 2：给品牌增加轻量高亮感，但避免过花**

如需增强品牌存在感，可加入轻量渐变文字或外层光感，但必须保持克制。例如可尝试：

```tsx
<Link to="/" className="bg-gradient-to-r from-white to-annie-lavender bg-clip-text text-xl font-bold tracking-[-0.02em] text-transparent md:text-2xl">
  Annie AI
</Link>
```

如果视觉过花，则退回纯白高权重文字。

- [ ] **步骤 3：运行构建验证品牌调整通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 4：Commit**

```bash
git add frontend/src/components/common/Header.tsx
git commit -m "feat: strengthen header brand presence"
```

### 任务 2：放大中间导航并提升“产品官网”气场

**文件：**
- 修改：`frontend/src/components/common/Header.tsx`

- [ ] **步骤 1：提升导航字号与间距**

将导航链接从当前较小尺寸提升到更大气的版本，例如：

```tsx
<nav className="hidden items-center gap-8 lg:flex xl:gap-10">
  {navItems.map((item) => (
    <Link
      key={item.key}
      to={item.to}
      className="text-[15px] font-medium text-white/70 transition duration-200 hover:text-white xl:text-base"
    >
      {item.label}
    </Link>
  ))}
</nav>
```

目标是让导航不再像普通文本链接，而像顶部主导航。

- [ ] **步骤 2：增强导航区域的横向呼吸感**

如果 Header 内部横向太紧，可适当放宽中间区域布局，例如：

```tsx
<div className="mx-auto flex max-w-8xl items-center justify-between gap-6 rounded-full ...">
```

必要时给品牌、导航、操作区设置更合理的 `flex` 分配，但不要引入复杂布局容器。

- [ ] **步骤 3：为 hover / 当前态预留更明确的存在感**

不需要完整 active route 逻辑，但至少让 hover 更明显，例如：

```tsx
className="text-[15px] font-medium text-white/70 transition duration-200 hover:text-white hover:drop-shadow-[0_0_16px_rgba(167,139,250,0.35)] xl:text-base"
```

如果阴影太重，保留文字提亮即可。

- [ ] **步骤 4：运行构建验证导航精修通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/Header.tsx
git commit -m "feat: enlarge and refine header navigation"
```

### 任务 3：把右侧登录区做成明确的独立操作区

**文件：**
- 修改：`frontend/src/components/common/Header.tsx`
- 可选修改：`frontend/src/components/common/ButtonLink.tsx`

- [ ] **步骤 1：让右侧操作区整体更像一个独立区块**

将右侧容器从普通按钮排列调整为更明确的操作区，例如：

```tsx
<div className="flex min-w-fit items-center justify-end gap-3">
  {/* buttons */}
</div>
```

必要时在 Header 主容器上增加更合理的对齐，例如：

```tsx
<div className="mx-auto grid max-w-8xl grid-cols-[auto_1fr_auto] items-center gap-6 rounded-full ...">
```

如果用 grid，必须保持代码简单，不为这次小改引入复杂结构。

- [ ] **步骤 2：增强未登录态按钮的层次关系**

要求：
- 登录按钮保持轻量，但明确可见
- 注册按钮保持主按钮地位
- 两者一起看上去像完整操作区，而不是随手摆在右边

建议按钮样式接近：

```tsx
<button className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/[0.12]">
  登录
</button>

<button className="rounded-full bg-gradient-to-r from-annie-purple to-annie-lavender px-6 py-2.5 text-sm font-semibold text-white shadow-glow-lg transition-all hover:-translate-y-0.5 hover:brightness-110">
  注册
</button>
```

- [ ] **步骤 3：同步优化已登录态的区块感**

已登录状态下，用户名和退出按钮也应维持右侧操作区气质，例如：

```tsx
<button className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/[0.12]">
  {user.username}
</button>
```

退出按钮可稍弱，但不能显得随意。

- [ ] **步骤 4：运行构建验证右侧操作区调整通过**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/Header.tsx frontend/src/components/common/ButtonLink.tsx
git commit -m "feat: refine header action area hierarchy"
```

仅当 `ButtonLink.tsx` 实际被改动时才加入 commit。

### 任务 4：整体平衡检查与验证

**文件：**
- 验证：`frontend/src/components/common/Header.tsx`

- [ ] **步骤 1：通读 Header JSX，确认三段权重更平衡**

检查标准：
- 左侧品牌更明显
- 中间导航更大气
- 右侧操作区更完整
- Header 没有因元素放大而显得拥挤

如果发现拥挤，优先通过 `gap`、`font-size`、`padding` 微调，不改结构范围。

- [ ] **步骤 2：运行最终前端构建**

运行：`cd frontend && npm run build`
预期：PASS；chunk size warning 可接受，但不得有编译错误

- [ ] **步骤 3：如本机具备 Docker，可验证前端镜像仍可构建**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS

若 Docker 不可用，明确记录跳过原因。

- [ ] **步骤 4：Commit 最终整理（仅在有新改动时）**

```bash
git add frontend/src/components/common/Header.tsx frontend/src/components/common/ButtonLink.tsx
git commit -m "chore: finalize header polish verification"
```

仅当验证步骤产生新改动时执行。

---

## 自检结果

### 规格覆盖度
- 左侧品牌放大：任务 1
- 中间导航更大气：任务 2
- 右侧登录区更完整：任务 3
- 整体平衡与构建验证：任务 4

### 占位符扫描
- 无 “TODO”“待定”“后续实现” 等占位语
- 每个任务都给出精确文件、代码方向与命令

### 类型一致性
- 继续沿用现有 `Header` 组件和 `navItems` 数据结构
- 不更改 Header 对外 API
- 仅做 Tailwind class 与布局层面的精修
