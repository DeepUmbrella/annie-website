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
      description: '与 Annie 进行自然流畅的对话，获得智能、有用的回答。支持多轮对话，保持上下文连贯性。',
      items: ['自然语言理解', '上下文记忆', '流式响应', '多轮对话'],
    },
    {
      icon: '📝',
      title: '任务管理',
      description: 'Annie 帮助你规划、追踪和管理任务，让工作更有条理。支持任务优先级、截止日期和提醒功能。',
      items: ['任务创建和编辑', '优先级设置', '截止日期追踪', '智能提醒'],
    },
    {
      icon: '🧠',
      title: '知识学习',
      description: 'Annie 会持续学习你的偏好和习惯，随着使用越来越懂你。个性化的服务体验，让沟通更高效。',
      items: ['偏好学习', '习惯追踪', '个性化推荐', '智能预测'],
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '你的数据安全是我们的首要任务。采用企业级加密标准，确保你的对话和个人信息得到妥善保护。',
      items: ['端到端加密', '数据隔离', '安全认证', '隐私保护'],
    },
    {
      icon: '🔌',
      title: '自动化工作流',
      description: '将 Annie 与你的常用工具连接，自动化重复任务。通过 webhook 和 API 集成打造专属工作流。',
      items: ['Webhook 集成', 'API 访问', '第三方连接', '自定义触发器'],
    },
    {
      icon: '📚',
      title: '知识库管理',
      description: '构建你的个人知识库，让 Annie 基于你的文档和数据进行回答。支持多种格式和智能检索。',
      items: ['文档上传', '智能检索', '知识图谱', 'RAG 检索增强'],
    },
    {
      icon: '🌐',
      title: '团队协作',
      description: '与团队成员共享 AI 能力，统一团队知识标准。支持权限管理和协作编辑。',
      items: ['团队空间', '权限控制', '知识共享', '协作面板'],
    },
    {
      icon: '⚡',
      title: '高性能引擎',
      description: '基于最新的大语言模型技术，提供快速响应和准确答案。支持流式输出和长上下文。',
      items: ['流式响应', '长上下文', '多模型支持', '智能路由'],
    },
  ];

  return (
    <div>
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

      <Section>
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-8 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{feature.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm leading-6 text-white/65 mb-4">{feature.description}</p>
                    <List
                      size="small"
                      dataSource={feature.items}
                      renderItem={item => (
                        <List.Item className="text-white/60 text-xs">{item}</List.Item>
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
          <h2 className="text-2xl font-semibold text-white mb-4">准备好开始了吗？</h2>
          <p className="text-base text-white/65 mb-8">
            立即注册 Annie，开启你的 AI 助力之旅。免费开始，无需信用卡。
          </p>
          <ButtonLink to="/register">免费注册</ButtonLink>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Features;
