import { Form, Input, Button, message, List } from 'antd';
import { useState } from 'react';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';
import ButtonLink from '../components/common/ButtonLink';

const Contact = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const API = import.meta.env.VITE_API_URL || '';
      const token = localStorage.getItem('token');
      
      await axios.post(`${API}/api/v1/feedback`, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      message.success('反馈已提交！');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="联系"
        title="关于本站"
        description="记录 AI 开发过程中的问题和心得，欢迎交流。"
      />

      <Section>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <GlassCard className="p-8">
              <h3 className="mb-4 text-[1.25rem] font-semibold text-white">联系方式</h3>
              <List
                size="small"
                split={false}
                dataSource={[
                  { icon: '📧', label: '邮箱', value: 'linany@linany.com' },
                  { icon: '🌐', label: '网站', value: 'https://www.linany.com' },
                ]}
                renderItem={item => (
                  <List.Item className="[&>div]:mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-white/45">{item.label}</p>
                        <p className="text-sm text-white/85">{item.value}</p>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </GlassCard>

            <div className="md:col-span-2 lg:col-span-2">
              <GlassCard className="p-8 h-full">
                <h3 className="mb-6 text-[1.25rem] font-semibold text-white">提交反馈</h3>
                <Form
                  form={form}
                  onFinish={handleSubmit}
                  layout="vertical"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Form.Item
                      name="name"
                      label={<span className="text-white/85">姓名</span>}
                    >
                      <Input 
                        placeholder="你的姓名（可选）"
                        className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label={<span className="text-white/85">邮箱</span>}
                      rules={[
                        { type: 'email', message: '请输入有效的邮箱地址' },
                      ]}
                    >
                      <Input 
                        placeholder="你的邮箱（可选）"
                        className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="subject"
                    label={<span className="text-white/85">主题</span>}
                    rules={[
                      { required: true, message: '请输入主题' },
                    ]}
                  >
                    <Input 
                      placeholder="反馈主题"
                      className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
                    />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label={<span className="text-white/85">消息</span>}
                    rules={[
                      { required: true, message: '请输入消息内容' },
                    ]}
                  >
                    <Input.TextArea 
                      rows={6}
                      placeholder="你的消息"
                      className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
                    />
                  </Form.Item>

                  <Form.Item className="mb-0">
                    <Button 
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitting}
                      disabled={submitting}
                      className="h-12 text-base font-semibold bg-gradient-to-r from-annie-purple via-fuchsia-500 to-annie-cyan border-0 hover:brightness-110"
                    >
                      提交反馈
                    </Button>
                  </Form.Item>
                </Form>
              </GlassCard>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
        <GlassCard className="mx-auto max-w-4xl p-8 md:p-12 text-center">
          <h2 className="mb-4 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">有问题或建议？</h2>
          <p className="mb-8 text-base leading-8 text-white/72 md:text-lg">
            欢迎通过上方方式联系，或浏览博客获取更多信息。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ButtonLink to="/docs">查看文档</ButtonLink>
            <ButtonLink to="/features" variant="secondary">探索功能</ButtonLink>
          </div>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Contact;
