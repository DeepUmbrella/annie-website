import Section from '../components/common/Section';
import ButtonLink from '../components/common/ButtonLink';

const minimaxLink = 'https://platform.minimaxi.com/subscribe/token-plan?code=H74avrqWBT&source=link';

const Home = () => {
  const capabilities = [
    { title: '智能对话', description: '记录 AI 对话系统的开发实践与优化经验。' },
    { title: '知识检索', description: '整理 AI 知识库、RAG 与向量检索的技术笔记。' },
    { title: '自动化工作流', description: '探索 AI 工作流编排、任务自动化的开发心得。' },
    { title: '开发者接入', description: '分享 API 设计、SDK 集成与开发者工具的经验。' },
    { title: '多端协作', description: '记录在不同平台上接入 AI 能力的开发过程。' },
    { title: '可控与安全', description: '整理 AI 安全、权限控制与合规开发的技术笔记。' },
  ];

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

  return (
    <div>
      {/* Hero Section */}
      <Section className="relative overflow-hidden pt-14 md:pt-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-annie-hero blur-3xl" />
        <div className="absolute right-0 top-8 -z-10 h-[420px] w-[420px] rounded-full bg-annie-purple/20 blur-[120px]" />
        <div className="absolute right-24 top-32 -z-10 h-[220px] w-[220px] rounded-full bg-annie-cyan/12 blur-[100px]" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-annie-cyan">
              个人AI开发笔记
            </span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5rem]">
                记录 AI 开发
                <br />
                从这里开始
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
                个人AI开发笔记，分享智能体开发的技术与心得。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <ButtonLink to="/blog">阅读笔记</ButtonLink>
              <ButtonLink to="/docs" variant="secondary">
                查看文档
              </ButtonLink>
              <a
                href={minimaxLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-annie-cyan to-annie-purple px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-cyan-glow hover:-translate-y-0.5"
              >
                minimax codeplan 打折推荐
              </a>
            </div>
          </div>

          {/* Hero Visual Panel */}
          <div className="relative space-y-4">
            <div className="relative mx-auto w-full max-w-2xl rounded-[2.25rem] border border-white/12 bg-white/[0.05] p-6 shadow-glow-lg backdrop-blur-2xl xl:p-7">
              <div className="space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-annie-cyan" />
                    <span className="text-sm font-medium text-white">Annie Core</span>
                  </div>
                  <span className="rounded-full border border-annie-cyan/20 bg-annie-cyan/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-annie-cyan">
                    Online
                  </span>
                </div>

                {/* Main Workspace Summary */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/80">工作区摘要</span>
                    <span className="text-xs text-annie-cyan">活跃</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-black/10 px-3 py-2 text-center">
                      <div className="text-lg font-semibold text-white">3</div>
                      <div className="text-[10px] text-white/50">对话</div>
                    </div>
                    <div className="rounded-xl bg-black/10 px-3 py-2 text-center">
                      <div className="text-lg font-semibold text-white">128</div>
                      <div className="text-[10px] text-white/50">文档</div>
                    </div>
                    <div className="rounded-xl bg-black/10 px-3 py-2 text-center">
                      <div className="text-lg font-semibold text-white">5</div>
                      <div className="text-[10px] text-white/50">工作流</div>
                    </div>
                  </div>
                </div>

                {/* Capability Modules */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-annie-lavender">💬</span>
                      <span className="text-xs font-medium text-white">对话引擎</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50">模型就绪</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-annie-cyan" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-annie-purple">📚</span>
                      <span className="text-xs font-medium text-white">知识库</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50">已索引</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-annie-cyan" />
                    </div>
                  </div>
                </div>

                {/* Status Bar with Emphasis */}
                <div className="rounded-2xl border-l-2 border-l-annie-cyan border-white/10 bg-gradient-to-r from-annie-cyan/5 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-annie-cyan" />
                      <span className="text-xs font-medium text-white">系统状态</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Secure</span>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Workflow Ready</span>
                      <span className="text-[10px] text-white/50 uppercase tracking-wider">Knowledge Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Module 1 - Response Speed */}
            <div className="absolute -left-8 top-16 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-cyan/20">
                  <span className="text-annie-cyan">⚡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">开发日志</p>
                  <p className="text-xs text-white/60">持续更新中</p>
                </div>
              </div>
            </div>

            {/* Floating Module 2 - Knowledge Access */}
            <div className="absolute -right-6 top-24 w-56 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-lavender/20">
                  <span className="text-annie-lavender">📚</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">技术笔记</p>
                  <p className="text-xs text-white/60">不断积累中</p>
                </div>
              </div>
            </div>

            {/* Floating Module 3 - Security Status */}
            <div className="absolute -right-6 bottom-12 w-52 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-cyan-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-purple/20">
                  <span className="text-annie-purple">🔒</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">开发记录</p>
                  <p className="text-xs text-white/60">记录成长</p>
                </div>
              </div>
            </div>

            {/* Floating Module 4 - Workflow Nodes */}
            <div className="absolute -left-12 -bottom-4 w-60 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-annie-cyan/20">
                  <span className="text-annie-cyan">🔄</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">工作流节点</p>
                  <p className="text-xs text-white/60">5 个活跃节点</p>
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
          <h2 className="mb-4 mt-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">核心能力</h2>
          <p className="mx-auto max-w-2xl text-base leading-8 text-white/70 md:text-lg">
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
              <h3 className="mb-3 text-[1.25rem] font-semibold text-white">{capability.title}</h3>
              <p className="text-sm leading-7 text-white/70">{capability.description}</p>
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
          <h2 className="mb-4 mt-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">使用场景</h2>
          <p className="mx-auto max-w-2xl text-base leading-8 text-white/70 md:text-lg">
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
              <h3 className="mb-3 text-[1.25rem] font-semibold text-white">{scenario.title}</h3>
              <p className="text-sm leading-7 text-white/70">{scenario.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Bottom CTA */}
      <Section className="pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] px-8 py-14 text-center shadow-glow-lg">
          <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-annie-lavender/20 blur-3xl" />
          <h2 className="mb-4 text-[2.5rem] font-semibold tracking-[-0.02em] text-white md:text-[3rem] lg:text-[3.5rem]">
            欢迎来到个人AI开发笔记
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
            这里记录 AI 开发过程中的技术笔记、工具心得与踩坑记录。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ButtonLink to="/blog">阅读更多</ButtonLink>
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
