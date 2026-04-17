# Annie 首页与公共布局改版实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 Annie 前台首页、Header 和 Footer 改造成接近 openclaw.ai 气质的产品官网风格，并引入 Tailwind CSS 作为主要样式方案。

**架构：** 本次实现只覆盖 `Home`、`Header`、`Footer` 与前端样式基础设施。先为 Vite 前端接入 Tailwind 与最小视觉 token，再重写公共布局组件和首页结构，保持其他页面暂不改版但不被新布局破坏。实现上以 Tailwind utility class 为主，少量保留 Ant Design 组件能力。

**技术栈：** React 19、Vite 8、TypeScript、Tailwind CSS、Ant Design、Redux Toolkit

---

## 文件结构

### 需要创建
- `frontend/tailwind.config.ts` - Tailwind 主题扩展，定义颜色、阴影、圆角、容器等最小 token
- `frontend/postcss.config.js` - Tailwind PostCSS 配置
- `frontend/src/components/common/Section.tsx` - 页面 section 容器组件，统一最大宽度与纵向间距
- `frontend/src/components/common/ButtonLink.tsx` - 首页/布局中使用的轻量按钮链接包装组件

### 需要修改
- `frontend/package.json` - 增加 Tailwind 相关依赖与必要脚本
- `frontend/package-lock.json` - 同步依赖锁文件
- `frontend/src/index.css` - 挂载 Tailwind，并定义全局背景、字体、基础类
- `frontend/src/App.tsx` - 调整全局布局背景与内容容器，确保新 Header/Footer 正常工作
- `frontend/src/components/common/Header.tsx` - 重写为浮层式产品官网导航
- `frontend/src/components/common/Footer.tsx` - 重写为简洁深色 Footer
- `frontend/src/pages/Home.tsx` - 重写首页结构为 Hero / 能力 / 场景 / CTA
- `frontend/vite.config.ts` - 如有必要补充路径/样式相关配置，保持最小变更

### 需要验证
- `frontend/src/pages/Home.tsx` 页面渲染
- `frontend/src/components/common/Header.tsx` 导航链接与登录态渲染
- `frontend/src/components/common/Footer.tsx` 静态渲染
- `frontend` 构建结果 `npm run build`

---

### 任务 1：接入 Tailwind CSS 基础设施

**文件：**
- 修改：`frontend/package.json`
- 修改：`frontend/package-lock.json`
- 创建：`frontend/tailwind.config.ts`
- 创建：`frontend/postcss.config.js`
- 修改：`frontend/src/index.css`

- [ ] **步骤 1：在 `frontend/package.json` 中添加 Tailwind 依赖**

将 `devDependencies` 补充以下包：

```json
{
  "tailwindcss": "^3.4.17",
  "postcss": "^8.4.49",
  "autoprefixer": "^10.4.20"
}
```

- [ ] **步骤 2：安装依赖并更新锁文件**

运行：`cd frontend && npm install`
预期：`package-lock.json` 更新，新增 Tailwind/PostCSS 相关依赖，无 `npm ci` 锁文件不同步错误

- [ ] **步骤 3：创建 `frontend/postcss.config.js`**

写入：

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **步骤 4：创建 `frontend/tailwind.config.ts` 并定义最小视觉 token**

写入：

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        annie: {
          bg: '#0B1020',
          panel: '#11162A',
          border: 'rgba(255,255,255,0.10)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          purple: '#7C3AED',
          lavender: '#A78BFA',
          cyan: '#22D3EE',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(167,139,250,0.18), 0 16px 48px rgba(124,58,237,0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'annie-radial': 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 38%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **步骤 5：改写 `frontend/src/index.css`，挂载 Tailwind 并定义全局基础样式**

将文件整理为类似：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #f8fafc;
  background: #0b1020;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at top, rgba(124, 58, 237, 0.16), transparent 30%),
    linear-gradient(180deg, #11162a 0%, #0b1020 100%);
  color: #f8fafc;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
```

- [ ] **步骤 6：运行构建验证 Tailwind 基础设施可用**

运行：`cd frontend && npm run build`
预期：通过，不报 PostCSS/Tailwind 配置缺失错误

- [ ] **步骤 7：Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/postcss.config.js frontend/tailwind.config.ts frontend/src/index.css
git commit -m "feat: add tailwind foundation for frontend redesign"
```

### 任务 2：抽取公共布局原语

**文件：**
- 创建：`frontend/src/components/common/Section.tsx`
- 创建：`frontend/src/components/common/ButtonLink.tsx`
- 修改：`frontend/src/App.tsx`

- [ ] **步骤 1：创建 `Section.tsx` 作为页面区块容器**

写入：

```tsx
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps {
  children: ReactNode;
  className?: string;
}

const Section = ({ children, className }: SectionProps) => {
  return (
    <section className={clsx('mx-auto w-full max-w-8xl px-6 py-16 md:px-8 md:py-24', className)}>
      {children}
    </section>
  );
};

export default Section;
```

如果项目未安装 `clsx`，则直接改为字符串拼接实现，不新增无关依赖。

- [ ] **步骤 2：创建 `ButtonLink.tsx` 封装主/次按钮链接样式**

写入：

```tsx
import { Link } from 'react-router-dom';

interface ButtonLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const baseClass =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200';

const variantClass = {
  primary:
    'bg-gradient-to-r from-annie-purple to-annie-lavender text-white shadow-glow hover:-translate-y-0.5',
  secondary:
    'border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10',
};

const ButtonLink = ({ to, children, variant = 'primary' }: ButtonLinkProps) => (
  <Link to={to} className={`${baseClass} ${variantClass[variant]}`}>
    {children}
  </Link>
);

export default ButtonLink;
```

- [ ] **步骤 3：调整 `frontend/src/App.tsx` 以承接新布局背景**

将最外层 `Layout` 从偏亮背景改成深色，并保证内容区域结构清晰，例如：

```tsx
<Layout className="min-h-screen bg-transparent text-annie-text">
  <Header />
  <Layout.Content className="flex-1">
    <Routes>{/* ... */}</Routes>
  </Layout.Content>
  <Footer />
</Layout>
```

保留 `Provider`、`ConfigProvider`、`Router`、`Routes` 结构不变。

- [ ] **步骤 4：运行构建验证公共原语接入不破坏现有页面**

运行：`cd frontend && npm run build`
预期：通过，若报 `clsx` 缺失则按步骤 1 的备注移除依赖

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/Section.tsx frontend/src/components/common/ButtonLink.tsx frontend/src/App.tsx
git commit -m "feat: add reusable layout primitives for homepage redesign"
```

### 任务 3：重写 Header 为产品官网样式导航

**文件：**
- 修改：`frontend/src/components/common/Header.tsx`
- 测试：`cd frontend && npm run build`

- [ ] **步骤 1：整理 `Header.tsx` 的依赖与状态来源**

保留：
- `useNavigate`
- `Link`
- `useSelector`
- `RootState`

删除当前依赖于 Ant Design `Menu` 的实现，改为手写导航结构。

- [ ] **步骤 2：将导航项改写为数组驱动的链接列表**

在组件内定义：

```tsx
const navItems = [
  { key: 'features', label: '功能', to: '/features' },
  { key: 'docs', label: '文档', to: '/docs' },
  { key: 'blog', label: '博客', to: '/blog' },
  { key: 'contact', label: '联系', to: '/contact' },
];
```

- [ ] **步骤 3：重写 Header JSX 结构**

实现为：
- 外层固定顶部容器
- 内层居中浮层导航条
- 左品牌、中导航、右操作区

目标代码结构类似：

```tsx
<header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
  <div className="mx-auto flex max-w-8xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
    <Link to="/" className="text-lg font-semibold tracking-tight text-white">
      Annie AI
    </Link>

    <nav className="hidden items-center gap-6 md:flex">
      {navItems.map((item) => (
        <Link key={item.key} to={item.to} className="text-sm text-annie-muted transition hover:text-white">
          {item.label}
        </Link>
      ))}
    </nav>

    <div className="flex items-center gap-3">
      {/* 登录态 / 未登录态 */}
    </div>
  </div>
</header>
```

- [ ] **步骤 4：保留登录态逻辑但替换视觉样式**

未登录态：
- 登录使用文本按钮风格
- 注册使用主按钮风格

登录态：
- 用户名使用轻按钮
- 退出使用次按钮或小型边框按钮

- [ ] **步骤 5：运行构建验证 Header 重写通过**

运行：`cd frontend && npm run build`
预期：通过，无 JSX/类型错误

- [ ] **步骤 6：Commit**

```bash
git add frontend/src/components/common/Header.tsx
git commit -m "feat: redesign header for product landing layout"
```

### 任务 4：重写 Footer 为简洁产品站收尾区

**文件：**
- 修改：`frontend/src/components/common/Footer.tsx`
- 测试：`cd frontend && npm run build`

- [ ] **步骤 1：审阅现有 `Footer.tsx` 并删除亮色/传统企业站样式**

保留内容表达，去掉与新深色页面不兼容的旧配色。

- [ ] **步骤 2：将 Footer 改为三段信息结构**

目标结构：
- 左：品牌说明
- 中：产品/资源链接
- 右：联系信息或 CTA 辅助文案

目标 JSX 类似：

```tsx
<footer className="border-t border-white/10 bg-black/10">
  <div className="mx-auto grid max-w-8xl gap-10 px-6 py-12 text-sm text-annie-muted md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
    {/* 品牌 */}
    {/* 产品链接 */}
    {/* 联系/资源 */}
  </div>
</footer>
```

- [ ] **步骤 3：统一 Footer 链接与文字层级**

规则：
- 标题白色
- 普通文字灰白色
- 链接 hover 提亮
- 不堆过多无关内容

- [ ] **步骤 4：运行构建验证 Footer 通过**

运行：`cd frontend && npm run build`
预期：通过

- [ ] **步骤 5：Commit**

```bash
git add frontend/src/components/common/Footer.tsx
git commit -m "feat: redesign footer for landing page"
```

### 任务 5：重写 Home 页面结构与视觉

**文件：**
- 修改：`frontend/src/pages/Home.tsx`
- 依赖：`frontend/src/components/common/Section.tsx`
- 依赖：`frontend/src/components/common/ButtonLink.tsx`

- [ ] **步骤 1：删除当前 Home 中偏旧版宣传页的结构与 inline style**

保持 `Home.tsx` 只承担页面编排，不在页面中硬编码大块旧的行内样式对象。

- [ ] **步骤 2：实现 Hero 区块**

Hero 需要包含：
- 小 badge
- 主标题
- 副标题
- 两个 CTA
- 右侧视觉卡片组

建议直接落成：

```tsx
<Section className="pt-12 md:pt-20">
  <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
    <div className="space-y-8">
      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-annie-lavender">
        AI Assistant Platform
      </span>
      <div className="space-y-4">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          让 Annie 成为你的智能协作中枢
        </h1>
        <p className="max-w-2xl text-base leading-7 text-annie-muted md:text-lg">
          面向个人、团队与开发者的 AI 助手平台，连接知识、工作流与自动化能力。
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <ButtonLink to="/register">立即体验</ButtonLink>
        <ButtonLink to="/docs" variant="secondary">查看文档</ButtonLink>
      </div>
    </div>
    <div>{/* Hero visual cards */}</div>
  </div>
</Section>
```

- [ ] **步骤 3：实现 Hero 右侧能力视觉面板**

使用 2 到 3 个浮层卡片表达：
- 对话
- 知识支持
- 自动化

不使用后台截图，只用文本与卡片层叠形成产品感。

- [ ] **步骤 4：实现“核心能力”区块**

定义数组：

```tsx
const capabilities = [
  { title: '智能对话', description: '用自然语言完成问答、协作与信息整合。' },
  { title: '知识检索', description: '连接文档、资料与上下文，让回答更可靠。' },
  { title: '自动化工作流', description: '把重复工作交给 Annie 编排与执行。' },
  { title: '开发者接入', description: '通过 API 和工具能力把 AI 接进你的产品。' },
  { title: '多端协作', description: '在不同入口之间保持一致的使用体验。' },
  { title: '可控与安全', description: '在权限、边界与行为上保持清晰可控。' },
];
```

再用 3 列卡片网格渲染。

- [ ] **步骤 5：实现“使用场景”区块**

定义 3 个场景卡：
- 个人效率助手
- 团队协作中枢
- 开发者 AI 接入层

每张卡片更大，描述偏结果导向。

- [ ] **步骤 6：实现底部 CTA 区块**

目标结构：

```tsx
<Section>
  <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center shadow-glow">
    <h2 className="text-3xl font-semibold text-white">准备好开始使用 Annie 了吗？</h2>
    <p className="mx-auto mt-4 max-w-2xl text-annie-muted">
      用更统一的 AI 交互体验连接知识、协作与自动化能力。
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <ButtonLink to="/register">开始使用</ButtonLink>
      <ButtonLink to="/docs" variant="secondary">查看开发文档</ButtonLink>
    </div>
  </div>
</Section>
```

- [ ] **步骤 7：运行构建验证首页改版通过**

运行：`cd frontend && npm run build`
预期：通过，页面 chunk 体积警告允许存在，但不得有编译错误

- [ ] **步骤 8：Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/components/common/Section.tsx frontend/src/components/common/ButtonLink.tsx
git commit -m "feat: redesign homepage in openclaw-inspired style"
```

### 任务 6：全链路验证与收尾

**文件：**
- 验证：`frontend`
- 验证：必要时 `backend` 与 `docker build` 上下文

- [ ] **步骤 1：本地运行前端构建**

运行：`cd frontend && npm run build`
预期：PASS

- [ ] **步骤 2：如本机具备 Docker，运行前端镜像构建验证**

运行：`cd /Users/yanlin/projects/annie-website && docker build -f frontend/Dockerfile frontend`
预期：PASS，能够产出前端镜像

如果本机没有 Docker，则记录跳过原因，不伪称已验证。

- [ ] **步骤 3：检查改版范围未意外扩散**

运行：`cd /Users/yanlin/projects/annie-website && git diff --stat HEAD~1..HEAD`
预期：变更集中在计划内文件，不误改其他业务页

- [ ] **步骤 4：Commit 最终整理（如有）**

```bash
git add frontend
git commit -m "chore: finalize homepage redesign verification"
```

仅在验证步骤引入实际文件变更时执行。

---

## 自检结果

### 规格覆盖度
- Header / Footer / Home 改版：已覆盖在任务 3、4、5
- Tailwind 接入：已覆盖在任务 1
- 最小视觉 token：已覆盖在任务 1
- 保持其他页面不改版：通过任务 2、6 的构建与范围检查保证

### 占位符扫描
- 已移除 “TODO”“后续实现”等占位语
- 每个任务均包含明确文件、命令与目标代码片段

### 类型一致性
- 统一使用 `Section`、`ButtonLink` 作为新增公共原语命名
- Header / Home / Footer 全部围绕同一套颜色 token `annie.*`
- `Tailwind` 主题键与页面 class 名保持一致
