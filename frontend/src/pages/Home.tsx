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
              <ButtonLink to="/docs" variant="secondary">
                查看文档
              </ButtonLink>
            </div>
          </div>

          {/* Hero Visual Cards */}
          <div className="relative space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-annie-purple" />
                <div className="h-2 w-2 rounded-full bg-annie-lavender" />
                <div className="h-2 w-2 rounded-full bg-annie-cyan" />
              </div>
              <div className="space-y-2 text-sm text-annie-muted">
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-annie-lavender">▸</span>
                  <p>智能对话引擎已就绪</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-annie-purple">▸</span>
                  <p>知识库索引完成</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-annie-cyan">▸</span>
                  <p>工作流节点加载正常</p>
                </div>
              </div>
            </div>

            <div className="relative -ml-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-annie-purple/20">
                  <span className="text-annie-purple">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">快速响应</p>
                  <p className="text-xs text-annie-muted">平均延迟 &lt;200ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Core Capabilities */}
      <Section>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">核心能力</h2>
          <p className="mx-auto max-w-2xl text-annie-muted">
            Annie 提供从基础对话到高级自动化的全链路能力
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <h3 className="mb-2 text-lg font-semibold text-white">{capability.title}</h3>
              <p className="text-sm text-annie-muted leading-6">{capability.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Use Cases */}
      <Section>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-semibold text-white md:text-4xl">使用场景</h2>
          <p className="mx-auto max-w-2xl text-annie-muted">
            适配不同角色与需求的灵活应用方式
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-annie-purple/50 hover:bg-white/10"
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
