import { Typography, Button, Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Title level={1} style={{ fontSize: '48px', marginBottom: '24px', color: '#190019' }}>
            让 AI 助手更懂你
          </Title>
          <Paragraph style={{ fontSize: '20px', color: '#522b5b', marginBottom: '32px' }}>
            Annie 是一个强大的 AI 助手，帮助你在工作和生活中更高效地完成目标。
            自然对话，智能响应，随时随地。
          </Paragraph>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button type="primary" size="large" style={{ background: '#522b5b' }}>
              <Link to="/register">开始使用</Link>
            </Button>
            <Button size="large">
              <Link to="/docs">了解更多</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px', color: '#190019' }}>
          核心功能
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <Title level={3}>智能对话</Title>
                <Paragraph>自然流畅的交流体验，像和朋友聊天一样</Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <Title level={3}>任务管理</Title>
                <Paragraph>帮你规划和追踪任务，让工作更有条理</Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <Title level={3}>知识学习</Title>
                <Paragraph>持续学习你的偏好，越来越懂你</Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
