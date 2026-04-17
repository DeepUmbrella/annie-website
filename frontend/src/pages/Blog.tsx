import { List, Typography, Empty, Spin, Tag } from 'antd';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';

const { Paragraph } = Typography;

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${API}/api/v1/blog/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Annie 博客与更新"
        description="了解 Annie 的最新功能、产品更新和 AI 行业洞察。"
      />

      <Section>
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <GlassCard className="p-16 text-center">
              <Spin size="large" />
              <p className="mt-4 text-white/65">加载中...</p>
            </GlassCard>
          ) : posts.length === 0 ? (
            <GlassCard className="p-16 text-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-white/65">暂无文章</span>
                }
              />
            </GlassCard>
          ) : (
            <List
              grid={{ gutter: 20, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
              dataSource={posts}
              renderItem={item => (
                <List.Item>
                  <GlassCard className="w-full h-full p-6 hover:border-white/20 transition-colors">
                    <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">{item.title}</h3>
                    <Paragraph 
                      className="text-white/65 text-sm mb-4"
                      ellipsis={{ rows: 3 }}
                    >
                      {item.excerpt || item.content}
                    </Paragraph>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag: any) => (
                          <Tag 
                            key={tag.id} 
                            className="bg-annie-purple/20 border-annie-purple/40 text-annie-cyan"
                          >
                            {tag.tag.name}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </List.Item>
              )}
            />
          )}
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
        <GlassCard className="mx-auto max-w-4xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">订阅更新</h2>
          <p className="text-base text-white/65 mb-8">
            获取最新的产品更新和 AI 行业洞察，第一时间了解 Annie 的新功能。
          </p>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Blog;
