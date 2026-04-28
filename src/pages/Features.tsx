import { List } from 'antd';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';
import ButtonLink from '../components/common/ButtonLink';

const Features = () => {
  const features = [
    {
      icon: '🤖',
      title: '智能对话',
      description: '记录 AI 对话系统的开发实践，包括对话设计、流式输出与上下文管理。',
      items: ['自然语言理解', '上下文记忆', '流式响应', '多轮对话'],
    },
    {
      icon: '📝',
      title: '任务管理',
      description: '整理 AI 任务编排与工作流自动化的开发经验，包括任务创建、调度与执行。',
      items: ['任务创建和编辑', '优先级设置', '截止日期追踪', '智能提醒'],
    },
    {
      icon: '🧠',
      title: '知识学习',
      description: '记录 AI 持续学习和个性化适应的技术方案，包括知识存储与检索。',
      items: ['偏好学习', '习惯追踪', '个性化推荐', '智能预测'],
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '整理 AI 安全、权限控制与合规开发的技术笔记，包括数据保护与访问控制。',
      items: ['端到端加密', '数据隔离', '安全认证', '隐私保护'],
    },
    {
      icon: '🔌',
      title: '自动化工作流',
      description: '探索 AI 工作流编排与自动化执行的技术实现，包括任务调度与监控。',
      items: ['Webhook 集成', 'API 访问', '第三方连接', '自定义触发器'],
    },
    {
      icon: '📚',
      title: '知识库管理',
      description: '记录 AI 知识库构建与检索增强的技术实践，包括向量检索与 RAG。',
      items: ['文档上传', '智能检索', '知识图谱', 'RAG 检索增强'],
    },
    {
      icon: '🌐',
      title: '团队协作',
      description: '整理多用户 AI 协作与共享的技术方案，包括权限管理与知识共享。',
      items: ['团队空间', '权限控制', '知识共享', '协作面板'],
    },
    {
      icon: '⚡',
      title: '高性能引擎',
      description: '记录 AI 模型调用优化与性能调优的技术笔记，包括缓存与负载均衡。',
      items: ['流式响应', '长上下文', '多模型支持', '智能路由'],
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="博客"
        title="开发笔记与技术分享"
        description="记录 AI 开发中的技术细节、工具使用与经验总结。"
        actions={
          <>
            <ButtonLink to="/blog">阅读笔记</ButtonLink>
            <ButtonLink to="/docs" variant="secondary">查看文档</ButtonLink>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-8 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-3 text-[1.25rem] font-semibold text-white">{feature.title}</h3>
                    <p className="mb-4 text-sm leading-7 text-white/72">{feature.description}</p>
                    <List
                      size="small"
                      dataSource={feature.items}
                      renderItem={item => (
                        <List.Item className="[&_span]:text-white/60 [&_span]:text-xs">{item}</List.Item>
                      )}
                      className="[&_li]:border-white/10 [&_li]:last:border-0"
                    />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
        <GlassCard className="mx-auto max-w-4xl p-8 md:p-12 text-center">
          <h2 className="mb-4 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">开始阅读笔记</h2>
          <p className="mb-8 text-base leading-8 text-white/72 md:text-lg">
            浏览 AI 开发技术笔记，开启学习之旅。
          </p>
          <ButtonLink to="/blog">阅读更多</ButtonLink>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Features;
