import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Docs from './pages/Docs';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Chat from './pages/Chat';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: '#22D3EE',
          colorText: '#F8FAFC',
          colorTextSecondary: '#A5B4FC',
          colorTextTertiary: '#94A3B8',
          colorTextQuaternary: '#64748B',
          colorBgContainer: 'transparent',
          colorBgElevated: 'rgba(255, 255, 255, 0.05)',
          colorBorder: 'rgba(148, 163, 184, 0.16)',
          borderRadius: 12,
        },
        components: {
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.04)',
            colorBorder: 'rgba(148, 163, 184, 0.16)',
            colorText: '#F8FAFC',
            colorTextPlaceholder: 'rgba(248, 250, 252, 0.38)',
          },
          Button: {
            colorText: '#F8FAFC',
            borderRadius: 12,
          },
          List: {
            colorText: '#F8FAFC',
            colorTextDescription: '#94A3B8',
          },
          Empty: {
            colorText: '#94A3B8',
          },
          Spin: {
            colorText: '#F8FAFC',
          },
          Tag: {
            colorText: '#F8FAFC',
          },
        },
      }}>
        <Router>
          <Layout className="min-h-screen bg-transparent text-annie-text">
            <Header />
            <Layout.Content className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout.Content>
            <Footer />
          </Layout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
