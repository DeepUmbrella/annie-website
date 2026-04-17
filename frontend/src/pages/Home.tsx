import Section from '../components/common/Section';
import ButtonLink from '../components/common/ButtonLink';

const Home = () => {
  const capabilities = [
    { title: '智能对话', description: '用自然语言完成问答、协作与信息整合。' },
    { title: '知识检索', description: '连接文档、资料与上下文，让回答更可靠。' },
    { title: '自动化工作流', description: '把重复工作交给 Annie 编排与执行。' },
    { title: '开发者接入', description: '通过 API 和工具能力把 AI 接进你的产品。' },
    { title: '多端协作', description: '在不同入口之间保持一致的使用体验。' },
    { title: '可控与安全', description: '在权限、边界与行为上保持清晰可控。' },
  ];

  const scenarios = [
    {
      title: '个人效率助手',
      description: '从日程管理到信息整理，让 Annie 成为你日常工作的得力伙伴，节省时间并提升效率。',
    },
    {
      title: '团队协作中枢',
      description: '统一团队的 AI 交互方式，共享知识库与工作流，让协作更顺畅，知识流动更自然。',
    },
    {
      title: '开发者 AI 接入层',
      description: '通过清晰的 API 与工具扩展，将 Annie 的能力无缝集成到你的应用中，快速构建 AI 原型。',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <Section className="relative overflow-hidden pt-14 md:pt-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-annie-hero blur-3xl" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
              AI Assistant Platform
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-7xl">
                让 <span className="bg-gradient-to-r from-white via-annie-lavender to-annie-cyan bg-clip-text text-transparent">Annie</span>
                <br />
                成为你的智能协作中枢
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                连接知识、对话与自动化能力，为个人、团队与开发者提供统一的 AI 工作入口。
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <ButtonLink to="/register">立即体验</ButtonLink>
              <ButtonLink to="/docs" variant="secondary">
                查看文档
              </ButtonLink>
            </div>
          </div>

          {/* Hero Visual Panel */}
          <div className="relative space-y-4">
            <div className="relative mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow-lg backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-annie-purple" />
                  <div className="h-2.5 w-2.5 rounded-full bg-annie-lavender" />
                  <div className="h-2.5 w-2.5 rounded-full bg-annie-cyan" />
                </div>
                <div className="text-xs text-annie-cyan">v2.1.0</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-annie-lavender">💬</span>
                    <p className="font-medium text-white">智能对话引擎</p>
                    <span className="ml-auto text-xs text-annie-cyan">运行中</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-annie-purple">📚</span>
                    <p className="font-medium text-white">知识检索系统</p>
                    <span className="ml-auto text-xs text-annie-cyan">已索引</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-annie-cyan">⚡</span>
                    <p className="font-medium text-white">自动化工作流</p>
                    <span className="ml-auto text-xs text-annie-cyan">就绪</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative -ml-8 -mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-cyan/20">
                  <span className="text-annie-cyan">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">响应速度</p>
                  <p className="text-xs text-white/60">平均延迟 &lt;200ms</p>
                </div>
              </div>
            </div>

            <div className="relative -mr-6 ml-auto w-4/5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-purple/20">
                  <span className="text-annie-purple">🔒</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">安全加密</p>
                  <p className="text-xs text-white/60">端到端保护</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section>
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
            Capabilities
          </span>
          <h2 className="mb-4 mt-4 text-3xl font-semibold text-white md:text-4xl">核心能力</h2>
          <p className="mx-auto max-w-2xl text-annie-muted">
            Annie 提供从基础对话到高级自动化的全链路能力
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-cyan-glow"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-annie-cyan">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{capability.title}</h3>
              <p className="text-sm text-annie-muted leading-6">{capability.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Use Cases */}
      <Section>
        <div className="mb-12 text-center">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
            Scenarios
          </span>
          <h2 className="mb-4 mt-4 text-3xl font-semibold text-white md:text-4xl">使用场景</h2>
          <p className="mx-auto max-w-2xl text-annie-muted">
            适配不同角色与需求的灵活应用方式
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 shadow-glow transition duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-annie-purple/20">
                <span className="text-2xl text-annie-purple">
                  {index === 0 ? '👤' : index === 1 ? '👥' : '⚙️'}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{scenario.title}</h3>
              <p className="text-sm text-annie-muted leading-6">{scenario.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Bottom CTA */}
      <Section className="pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center shadow-glow md:px-12 md:py-16">
          <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">
            准备好开始使用 Annie 了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-annie-muted md:text-lg">
            用更统一的 AI 交互体验连接知识、协作与自动化能力。
          </p>
          <div className="flex justify-center gap-4">
            <ButtonLink to="/register">开始使用</ButtonLink>
            <ButtonLink to="/docs" variant="secondary">
              查看开发文档
            </ButtonLink>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Home;
