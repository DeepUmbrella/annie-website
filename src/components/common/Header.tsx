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
      <div className="mx-auto flex max-w-8xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        <Link to="/" className="text-xl font-bold tracking-[-0.02em] text-white md:text-2xl">
          Annie AI
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="text-sm text-white/65 transition duration-200 hover:text-white"
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
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/12"
              >
                {user.username}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/12"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-sm text-white backdrop-blur-md transition hover:bg-white/12"
              >
                登录
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-full bg-gradient-to-r from-annie-purple to-annie-lavender px-5 py-2.5 text-sm font-semibold text-white shadow-glow-lg transition-all hover:-translate-y-0.5 hover:brightness-110"
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
