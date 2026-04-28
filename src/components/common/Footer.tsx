const Footer = () => {
  return (
    <footer className="border-t border-white/8 bg-slate-950/40">
      <div className="mx-auto grid max-w-8xl gap-10 px-6 py-12 text-sm text-annie-muted md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        {/* Brand */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">个人AI开发笔记</h3>
          <p className="leading-6">
            个人 AI 开发笔记，记录技术、工具与思考。
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">导航</h3>
          <ul className="space-y-3">
            <li>
              <a href="/features" className="transition hover:text-white">
                博客
              </a>
            </li>
            <li>
              <a href="/docs" className="transition hover:text-white">
                文档
              </a>
            </li>
            <li>
              <a href="/blog" className="transition hover:text-white">
                技术笔记
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-white">
                关于
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
            个人AI开发笔记 © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
