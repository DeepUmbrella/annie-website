import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { key: 'features', label: '功能', to: '/features' },
    { key: 'docs', label: '文档', to: '/docs' },
    { key: 'blog', label: '博客', to: '/blog' },
    { key: 'contact', label: '联系', to: '/contact' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-8xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
        <Link to="/" className="text-lg font-semibold tracking-tight text-white">
          Annie AI
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="text-sm text-annie-muted transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                {user.username}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-white transition hover:text-annie-lavender"
              >
                登录
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-full bg-gradient-to-r from-annie-purple to-annie-lavender px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5"
              >
                注册
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
