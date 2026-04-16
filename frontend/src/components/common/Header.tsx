import { Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const menuItems = [
    { key: 'home', label: <Link to="/">首页</Link> },
    { key: 'features', label: <Link to="/features">功能</Link> },
    { key: 'docs', label: <Link to="/docs">文档</Link> },
    { key: 'blog', label: <Link to="/blog">博客博客, label: <Link to="/contact">联系我们</Link> },
  ];

  return (
    <Layout.Header style={{ display: 'flex', alignItems: 'center', background: '#2b124c', padding: '0 24px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginRight: '48px' }}>
        Annie AI
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['home']}
        items={menuItems}
        style={{ flex: 1, background: 'transparent', border: 'none' }}
      />
      <div style={{ display: 'flex', gap: '12px' }}>
        {user ? (
          <>
            <Button type="link" style={{ color: 'white' }} onClick={() => navigate('/profile')}>
              {user.username}
            </Button>
            <Button onClick={handleLogout}>退出</Button>
          </>
        ) : (
          <>
            <Button type="link" style={{ color: 'white' }} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
