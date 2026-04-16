import { Typography, Card, Form, Input, Button, message, Row, Col, List } from 'antd';
import axios from 'axios';

const { Title, Paragraph } = Typography;

const Contact = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      
      await axios.post(`${API}/api/v1/feedback`, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      message.success('反馈已提交！');
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || '提交失败');
    }
  };

  return (
    <div style={{ padding: '48px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '48px', color: '#190019' }}>
          联系我们
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="联系我们" style={{ height: '100%', background: '#Fbe4d8' }}>
              <Paragraph>
                如果你有任何问题或建议，欢迎与我们联系。
                我们会尽快回复你的消息。
              </Paragraph>
              <List>
                <List.Item>📧 邮箱: support@annie.ai</List.Item>
                <List.Item>🌐 网站: https://annie.ai</List.Item>
                <List.Item>💬 社区: https://community.annie.ai</List.Item>
              </List>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="提交反馈">
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label="姓名"
                >
                  <Input placeholder="你的姓名（可选）" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <Input placeholder="你的邮箱（可选）" />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="主题"
                  rules={[
                    { required: true, message: '请输入主题' },
                  ]}
                >
                  <Input placeholder="反馈主题" />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="消息"
                  rules={[
                    { required: true, message: '请输入消息内容' },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="你的消息" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    提交反馈
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Contact;
