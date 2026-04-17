import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { loginAsync } from '../../slices/authSlice';
import AuthShell from '../../components/common/AuthShell';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(loginAsync(values)).unwrap();
      message.success('登录成功！');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    }
  };

  return (
    <AuthShell
      title="欢迎回来"
      description="继续使用 Annie，连接你的知识、协作与自动化工作流。"
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
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
            登录
          </Button>
        </Form.Item>

        <div className="text-center text-sm text-white/65">
          还没有账号？{' '}
          <Link 
            to="/register"
            className="text-annie-cyan hover:text-cyan-400 transition-colors"
          >
            立即注册
          </Link>
        </div>
      </Form>
    </AuthShell>
  );
};

export default Login;
