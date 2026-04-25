import { Button, Empty, Form, Input, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';

type CurrentUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    displayName?: string;
    bio?: string;
  } | null;
};

const API = import.meta.env.VITE_API_URL || '';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = response.data.user;
        setUser(currentUser);
        form.setFieldsValue({
          displayName: currentUser.profile?.displayName || '',
          bio: currentUser.profile?.bio || '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [form, token]);

  const handleSubmit = async (values: { displayName?: string; bio?: string }) => {
    if (!token) return;
    setSaving(true);
    try {
      const response = await axios.put(`${API}/api/v1/auth/profile`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) => (prev ? { ...prev, profile: response.data.profile } : prev));
      message.success('个人资料更新成功');
    } catch (error: any) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <Section>
        <GlassCard className="mx-auto max-w-3xl p-12 text-center">
          <Empty description={<span className="text-white/72">请先登录后查看个人资料</span>} />
        </GlassCard>
      </Section>
    );
  }

  if (loading) {
    return (
      <Section>
        <div className="mx-auto flex min-h-[320px] max-w-4xl items-center justify-center">
          <Spin size="large" />
        </div>
      </Section>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Profile"
        title="个人资料"
        description="查看账号信息并维护你的基础资料。"
      />

      <Section>
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard className="p-6 md:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">账号信息</h2>
            <div className="space-y-3 text-sm text-white/75">
              <div><span className="text-white/45">用户名：</span>{user?.username}</div>
              <div><span className="text-white/45">邮箱：</span>{user?.email}</div>
              <div><span className="text-white/45">角色：</span>{user?.role}</div>
              <div><span className="text-white/45">注册时间：</span>{user?.createdAt?.slice(0, 10)}</div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 md:p-8">
            <h2 className="mb-6 text-xl font-semibold text-white">编辑资料</h2>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="displayName" label={<span className="text-white/85">显示名称</span>}>
                <Input placeholder="比如：Annie Builder" />
              </Form.Item>
              <Form.Item name="bio" label={<span className="text-white/85">简介</span>}>
                <Input.TextArea rows={5} placeholder="简单介绍一下你自己" />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" loading={saving}>
                  保存资料
                </Button>
              </Form.Item>
            </Form>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
};

export default Profile;
