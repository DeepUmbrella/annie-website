const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto grid max-w-8xl gap-10 px-6 py-12 text-sm text-annie-muted md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        {/* Brand */}
        <div>
          <h3 className="mb-4 text-base font-semibold text-white">Annie AI</h3>
          <p className="leading-6">
            面向个人、团队与开发者的 AI 助手平台，连接知识、工作流与自动化能力。
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
          <h3 className="mb-4 text-base-base font-semibold text-white">资源</h3>
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
