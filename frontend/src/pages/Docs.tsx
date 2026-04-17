import { Input, List, Typography, Empty } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';

const { Paragraph } = Typography;

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const searchDocs = async () => {
      if (searchQuery) {
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await axios.get(`${API}/api/v1/docs/search?q=${searchQuery}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Failed to search docs:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchDocs, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const docSections = [
    {
      title: '快速开始',
      path: 'getting-started',
      description: '快速上手 Annie API',
      icon: '🚀',
    },
    {
      title: '认证 API',
      path: 'api/authentication',
      description: '用户注册、登录和个人资料管理',
      icon: '🔑',
    },
    {
      title: '对话 API',
      path: 'api/chat',
      description: '与 Annie AI 助手进行对话',
      icon: '💬',
    },
    {
      title: '知识库 API',
      path: 'api/knowledge',
      description: '管理和查询你的知识库',
      icon: '📚',
    },
    {
      title: '自动化 API',
      path: 'api/automation',
      description: '构建自动化工作流和集成',
      icon: '⚡',
    },
    {
      title: '团队协作 API',
      path: 'api/team',
      description: '团队空间和权限管理',
      icon: '👥',
    },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Docs"
        title="开发者文档"
        description="探索 Annie 的完整 API 文档和开发指南，快速构建你的 AI 应用。"
      />

      <Section>
        <div className="mx-auto max-w-6xl">
          <GlassCard className="mb-12 p-6 md:p-8">
            <Input.Search
              placeholder="搜索文档..."
              allowClear
              enterButton
              size="large"
              className="search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </GlassCard>

          {searchQuery && searchResults.length > 0 ? (
            <div>
              <h2 className="mb-6 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">
                搜索结果
              </h2>
              <List
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item className="mb-4">
                    <GlassCard className="w-full p-6 transition-colors hover:border-white/20">
                      <h3 className="mb-2 text-[1.25rem] font-semibold text-white">{item.title}</h3>
                      <Paragraph className="text-sm leading-7 text-white/72" ellipsis={{ rows: 2 }}>
                        {item.excerpt}
                      </Paragraph>
                    </GlassCard>
                  </List.Item>
                )}
              />
            </div>
          ) : searchQuery ? (
            <GlassCard className="p-12 text-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-white/72">未找到匹配的文档</span>}
              />
            </GlassCard>
          ) : (
            <>
              <h2 className="mb-6 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">
                文档目录
              </h2>
              <List
                grid={{ gutter: 20, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                dataSource={docSections}
                renderItem={(item) => (
                  <List.Item>
                    <GlassCard className="h-full w-full cursor-pointer p-6 transition-colors hover:border-white/20">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div className="flex-1">
                          <h3 className="mb-2 text-[1.25rem] font-semibold text-white">{item.title}</h3>
                          <Paragraph className="text-sm leading-7 text-white/72" ellipsis={{ rows: 2 }}>
                            {item.description}
                          </Paragraph>
                        </div>
                      </div>
                    </GlassCard>
                  </List.Item>
                )}
              />
            </>
          )}
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
        <GlassCard className="mx-auto max-w-4xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">
            需要更多帮助？
          </h2>
          <p className="mb-8 text-base leading-8 text-white/72 md:text-lg">
            查看我们的 API 参考和示例代码，或者加入开发者社区获取支持。
          </p>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Docs;
