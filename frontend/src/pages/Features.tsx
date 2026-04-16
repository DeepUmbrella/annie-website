import { Typography, Row, Col, Card, List } from 'antd';

const { Title, Paragraph } = Typography;

const Features = () => {
  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '48px', color: '#190019' }}>
          Annie 功能介绍
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="🤖 智能对话" style={{ height: '100%', background: '#Fbe4d8' }}>
              <Paragraph>
                与 Annie 进行自然流畅的对话，获得智能、有用的回答。
                支持多轮对话，保持上下文连贯性。
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  '自然语言理解',
                  '上下文记忆',
                  '流式响应',
                  '多轮对话',
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="📝 任务管理" style={{ height: '100%', background: '#Dfb6b2' }}>
              <Paragraph>
                Annie 帮助你规划、追踪和管理任务，让工作更有条理。
                支持任务优先级、截止日期和提醒功能。
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  '任务创建和编辑',
                  '优先级设置',
                  '截止日期追踪',
                  '智能提醒',
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🧠 知识学习" style={{ height: '100%', background: '#854F6c' }}>
              <Paragraph>
                Annie 会持续学习你的偏好和习惯，随着使用越来越懂你。
                个性化的服务体验，让沟通更高效。
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  '偏好学习',
                  '习惯追踪',
                  '个性化推荐',
                  '智能预测',
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="🔒 安全可靠" style={{ height: '100%', background: '#522b5b' }}>
              <Paragraph>
                你的数据安全是我们的首要任务。采用企业级加密标准，
                确保你的对话和个人信息得到妥善保护。
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  '端到端加密',
                  '数据隔离',
                  '安全认证',
                  '隐私保护',
                ]}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Features;
