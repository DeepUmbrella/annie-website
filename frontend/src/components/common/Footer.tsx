const Footer = () => {
  return (
    <footer className="border-t border-white/8 bg-slate-950/40">
      <div className="mx-auto grid max-w-8xl gap-10 px-6 py-12 text-sm text-annie-muted md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        {/* Brand */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">Annie AI</h3>
          <p className="leading-6">
            连接知识、对话与自动化，为个人与团队提供统一的 AI 工作入口。
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">产品</h3>
          <ul className="space-y-3">
            <li>
              <a href="/features" className="transition hover:text-white">
                功能特性
              </a>
            </li>
            <li>
              <a href="/docs" className="transition hover:text-white">
                开发文档
              </a>
            </li>
            <li>
              <a href="/blog" className="transition hover:text-white">
                技术博客
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-white">
                联系我们
              </a>
            </li>
          </ul>
        </div>

        {/* Contact / Resources */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">资源</h3>
          <ul className="space-y-3">
            <li>
              <a href="/docs" className="transition hover:text-white">
                API 文档
              </a>
            </li>
            <li>
              <a href="/features" className="transition hover:text-white">
                使用指南
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-white">
                技术支持
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs">
            Annie AI 助手 © 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
