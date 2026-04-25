import { Empty, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  publishedAt?: string | null;
  createdAt: string;
  tags?: Array<{ tag: { id: string; name: string; slug: string } }>;
  author?: { username: string };
};

const { Paragraph } = Typography;
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      try {
        const response = await axios.get(`${API}/api/v1/blog/posts/${slug}`);
        setPost(response.data);
      } catch (error) {
        console.error('Failed to load blog post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    void loadPost();
  }, [slug]);

  if (loading) {
    return (
      <Section>
        <div className="mx-auto flex min-h-[320px] max-w-6xl items-center justify-center">
          <Spin size="large" />
        </div>
      </Section>
    );
  }

  if (!post) {
    return (
      <Section>
        <GlassCard className="mx-auto max-w-4xl p-12 text-center">
          <Empty description={<span className="text-white/72">文章不存在或尚未发布</span>} />
          <div className="mt-6">
            <Link to="/blog" className="text-annie-cyan hover:text-cyan-400">返回博客列表</Link>
          </div>
        </GlassCard>
      </Section>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Blog Detail"
        title={post.title}
        description={post.excerpt || 'Annie 博客文章详情'}
      />

      <Section>
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
            <Link to="/blog" className="text-annie-cyan hover:text-cyan-400">← 返回博客</Link>
            <span>•</span>
            <span>{post.publishedAt?.slice(0, 10) || post.createdAt.slice(0, 10)}</span>
            {post.author?.username && (
              <>
                <span>•</span>
                <span>{post.author.username}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(post.tags || []).map(({ tag }) => (
              <Tag key={tag.id} className="border border-annie-cyan/20 bg-annie-cyan/10 text-annie-cyan">
                {tag.name}
              </Tag>
            ))}
          </div>

          <GlassCard className="p-6 md:p-8">
            <Paragraph className="mb-6 text-base leading-8 text-white/72">
              {post.excerpt}
            </Paragraph>
            <pre className="whitespace-pre-wrap break-words rounded-[1.25rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/75">
              {post.content}
            </pre>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
};

export default BlogDetail;
