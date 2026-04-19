import { Tag, Typography } from 'antd';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';

type BlogPost = {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
};

const { Paragraph } = Typography;

const posts: BlogPost[] = [
  {
    title: 'Windows 安装 OpenClaw，国内可直接装，不用魔法',
    excerpt: '一份给 Windows 用户的 OpenClaw 安装说明，包含国内镜像、版本安装、守护进程启动与卸载命令。',
    date: '2026-04-19',
    readTime: '3 min read',
    tags: ['Windows', 'OpenClaw', '国内安装', 'CLI'],
    content: `文档地址： http://cmdallow.com:3000

主播亲测有效。

下面这些命令建议在「管理员模式」的命令行里执行：

1. 安装 Node.js
- 下载： https://nodejs.org/dist/v22.22.2/node-v22.22.2-x64.msi

2. 设置国内 npm 镜像
\`\`\`bash
npm config set registry https://registry.npmmirror.com
\`\`\`

3. 安装 OpenClaw
\`\`\`bash
npm i -g openclaw@latest
npm i -g openclaw@2026.4.9
openclaw onboard --install-daemon
\`\`\`

4. 如果你用 pnpm
\`\`\`bash
npm i -g pnpm
pnpm config set registry https://registry.npmmirror.com
pnpm add -g openclaw@latest
pnpm add -g openclaw@2026.4.9
pnpm approve-builds -g
openclaw onboard --install-daemon
\`\`\`

5. 免费大模型站点
- OpenRouter: https://openrouter.ai/ （搜 free）

6. 常用命令
\`\`\`bash
openclaw gateway start
openclaw gateway stop
\`\`\`

7. 卸载
\`\`\`bash
openclaw gateway stop
openclaw gateway uninstall
openclaw uninstall
npm rm -g openclaw
pnpm remove -g openclaw
\`\`\`

8. 清理本地数据
- macOS / Linux：删除 \`~/.openclaw\`
- Windows：删除用户目录下的 \`.openclaw\`

9. 备注
- 文档稍后会继续更新
- 适合 Windows 用户直接照着装`,
  },
];

const Blog = () => {
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

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <GlassCard className="p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/55">
                <span>{featuredPost.date}</span>
                <span>•</span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h3 className="mb-4 text-[1.8rem] font-semibold tracking-[-0.02em] text-white md:text-[2.25rem]">
                {featuredPost.title}
              </h3>
              <Paragraph className="mb-6 text-base leading-8 text-white/72">
                {featuredPost.excerpt}
              </Paragraph>
              <div className="flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <Tag key={tag} className="border border-annie-cyan/20 bg-annie-cyan/10 text-annie-cyan">
                    {tag}
                  </Tag>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8">
              <h4 className="mb-4 text-lg font-semibold text-white">这篇文章包含</h4>
              <ul className="space-y-3 text-sm leading-7 text-white/70">
                <li>• Windows 安装 OpenClaw 的国内镜像配置</li>
                <li>• npm / pnpm 两种安装方式</li>
                <li>• gateway 启动与停止命令</li>
                <li>• 卸载与清理路径</li>
              </ul>
            </GlassCard>
          </div>

          <GlassCard className="p-6 md:p-8">
            <h4 className="mb-4 text-[1.4rem] font-semibold tracking-[-0.02em] text-white">
              文章正文
            </h4>
            <pre className="whitespace-pre-wrap break-words rounded-[1.25rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/75">
              {featuredPost.content}
            </pre>
          </GlassCard>
        </div>
      </Section>

      <Section className="bg-gradient-to-b from-transparent to-white/[0.02]">
        <GlassCard className="mx-auto max-w-4xl p-8 text-center md:p-12">
          <h2 className="mb-4 text-[2rem] font-semibold tracking-[-0.02em] text-white md:text-[2.5rem] lg:text-[3rem]">
            订阅更新
          </h2>
          <p className="mb-8 text-base leading-8 text-white/72 md:text-lg">
            后面我会继续把 Annie 的使用说明、安装文档和更新公告陆续放到这里。
          </p>
        </GlassCard>
      </Section>
    </div>
  );
};

export default Blog;
