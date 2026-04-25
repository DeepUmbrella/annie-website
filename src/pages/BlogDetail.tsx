import { Empty, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

const API = import.meta.env.VITE_API_URL || '';

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
        eyebrow="Blog"
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
            {post.excerpt && (
              <p className="mb-6 text-base leading-8 text-white/72 border-l-2 border-annie-cyan pl-4 italic">
                {post.excerpt}
              </p>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const isInline = !match && !codeString.includes('\n');
                  if (isInline) {
                    return (
                      <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-annie-cyan" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match ? match[1] : 'bash'}
                      PreTag="div"
                      className="rounded-xl !bg-[#1a1b26] !my-4 text-sm"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                },
                p({ children }) {
                  return <p className="mb-4 leading-7 text-white/80">{children}</p>;
                },
                h1({ children }) {
                  return <h1 className="mb-4 mt-8 text-2xl font-bold text-white">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="mb-3 mt-6 text-xl font-bold text-white">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="mb-2 mt-4 text-lg font-bold text-white">{children}</h3>;
                },
                ul({ children }) {
                  return <ul className="mb-4 list-disc space-y-1 pl-6 text-white/80">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="mb-4 list-decimal space-y-1 pl-6 text-white/80">{children}</ol>;
                },
                li({ children }) {
                  return <li className="leading-7">{children}</li>;
                },
                a({ href, children }) {
                  return (
                    <a href={href} className="text-annie-cyan underline hover:text-cyan-400" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return <blockquote className="border-l-2 border-annie-cyan/60 pl-4 italic text-white/60">{children}</blockquote>;
                },
                hr() {
                  return <hr className="my-6 border-white/10" />;
                },
                strong({ children }) {
                  return <strong className="font-bold text-white">{children}</strong>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
};

export default BlogDetail;
