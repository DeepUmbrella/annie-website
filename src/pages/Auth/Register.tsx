import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { registerAsync } from '../../slices/authSlice';
import AuthShell from '../../components/common/AuthShell';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(registerAsync(values)).unwrap();
      message.success('注册成功！');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '注册失败');
    }
  };

  return (
    <AuthShell
      title="开始使用 Annie"
      description="创建账号，进入统一的 AI 产品体验。"
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label={<span className="text-white/85">用户名</span>}
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少 3 个字符' },
          ]}
        >
          <Input 
            placeholder="请输入用户名"
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="text-white/85">邮箱</span>}
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input 
            placeholder="请输入邮箱"
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="text-white/85">密码</span>}
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少 8 个字符' },
          ]}
        >
          <Input.Password 
            placeholder="请输入密码"
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/40"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button 
            type="primary"
            htmlType="submit"
            block
            className="h-12 text-base font-semibold bg-gradient-to-r from-annie-purple via-fuchsia-500 to-annie-cyan border-0 hover:brightness-110"
          >
            注册
          </Button>
        </Form.Item>

        <div className="text-center text-sm text-white/65">
          已有账号？{' '}
          <Link 
            to="/login"
            className="text-annie-cyan hover:text-cyan-400 transition-colors"
          >
            立即登录
          </Link>
        </div>
      </Form>
    </AuthShell>
  );
};

export default Register;
