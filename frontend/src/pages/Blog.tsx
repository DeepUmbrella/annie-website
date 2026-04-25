import { Empty, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
};

const { Paragraph } = Typography;
const API = import.meta.env.VITE_API_URL || '';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await axios.get(`${API}/api/v1/blog/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, []);

  const featuredPost = posts[0];

  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Annie 博客与更新"
        description="这里会放 Annie 的公告、使用指南和精选教程。"
      />

      <Section>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">
              最新文章
            </h2>
            <span className="text-sm text-white/55">{posts.length} 篇</span>
          </div>

          {loading ? (
            <GlassCard className="flex min-h-[240px] items-center justify-center p-8">
              <Spin size="large" />
            </GlassCard>
          ) : !featuredPost ? (
            <GlassCard className="p-12 text-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-white/72">暂时还没有已发布的文章</span>}
              />
            </GlassCard>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <GlassCard className="p-6 md:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/55">
                    <span>{featuredPost.publishedAt?.slice(0, 10) || featuredPost.createdAt.slice(0, 10)}</span>
                    <span>•</span>
                    <span>{Math.max(1, Math.ceil(featuredPost.content.length / 400))} min read</span>
                  </div>
                  <Link to={`/blog/${featuredPost.slug}`}>
                    <h3 className="mb-4 text-[1.8rem] font-semibold tracking-[-0.02em] text-white md:text-[2.25rem] hover:text-annie-cyan transition-colors">
                      {featuredPost.title}
                    </h3>
                  </Link>
                  <Paragraph className="mb-6 text-base leading-8 text-white/72">
                    {featuredPost.excerpt || featuredPost.content.slice(0, 140)}
                  </Paragraph>
                  <div className="flex flex-wrap gap-2">
                    {(featuredPost.tags || []).map(({ tag }) => (
                      <Tag key={tag.id} className="border border-annie-cyan/20 bg-annie-cyan/10 text-annie-cyan">
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6 md:p-8">
                  <h4 className="mb-4 text-lg font-semibold text-white">文章预览</h4>
                  <pre className="whitespace-pre-wrap break-words rounded-[1.25rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/75">
                    {featuredPost.content.slice(0, 500)}{featuredPost.content.length > 500 ? '...' : ''}
                  </pre>
                </GlassCard>
              </div>

              {posts.length > 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {posts.slice(1).map((post) => (
                    <GlassCard key={post.id} className="p-6">
                      <Link to={`/blog/${post.slug}`}>
                        <h4 className="mb-3 text-xl font-semibold text-white hover:text-annie-cyan transition-colors">
                          {post.title}
                        </h4>
                      </Link>
                      <Paragraph className="text-sm leading-7 text-white/72">
                        {post.excerpt || post.content.slice(0, 120)}
                      </Paragraph>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Section>
    </div>
  );
};

export default Blog;
