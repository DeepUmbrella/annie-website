import { expect, test } from '@playwright/test';

test('注册流程可用并自动登录', async ({ page }) => {
  const nonce = Date.now();
  const user = {
    username: `register_user_${nonce}`,
    email: `register_${nonce}@linany.com`,
    password: 'Test123456',
  };

  await page.goto('/register');
  await page.getByLabel('用户名').fill(user.username);
  await page.getByLabel('邮箱').fill(user.email);
  await page.getByLabel('密码').fill(user.password);

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/register') && response.status() === 201,
    ),
    page.locator('form').evaluate((form) => (form as HTMLFormElement).requestSubmit()),
  ]);

  await expect(page.getByRole('button', { name: user.username })).toBeVisible();
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
});

test('Blog 列表和详情可以联调显示已发布文章', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `blog_user_${nonce}`,
    email: `blog_${nonce}@linany.com`,
    password: 'Test123456',
  };

  const registerResponse = await request.post('http://127.0.0.1:3001/api/v1/auth/register', { data: user });
  expect(registerResponse.ok()).toBeTruthy();
  const registerData = await registerResponse.json();

  const createResponse = await request.post('http://127.0.0.1:3001/api/v1/blog/posts', {
    headers: { Authorization: `Bearer ${registerData.token}` },
    data: {
      title: `E2E Blog ${nonce}`,
      slug: `e2e-blog-${nonce}`,
      content: '这是一篇用于联调测试的博客正文。',
      excerpt: '这是一篇用于联调测试的博客摘要。',
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const post = await createResponse.json();

  const publishResponse = await request.put(`http://127.0.0.1:3001/api/v1/blog/posts/${post.id}`, {
    headers: { Authorization: `Bearer ${registerData.token}` },
    data: { published: true },
  });
  expect(publishResponse.ok()).toBeTruthy();

  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: `E2E Blog ${nonce}` })).toBeVisible();
  await page.getByRole('heading', { name: `E2E Blog ${nonce}` }).click();
  await expect(page).toHaveURL(new RegExp(`/blog/e2e-blog-${nonce}$`));
  await expect(page.getByText('这是一篇用于联调测试的博客正文。')).toBeVisible();
});

test('Chat 页面可以创建会话并发送消息', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `chat_user_${nonce}`,
    email: `chat_${nonce}@linany.com`,
    password: 'Test123456',
  };

  const registerResponse = await request.post('http://127.0.0.1:3001/api/v1/auth/register', { data: user });
  expect(registerResponse.ok()).toBeTruthy();
  const registerData = await registerResponse.json();

  await page.addInitScript((token) => {
    window.localStorage.setItem('token', token as string);
  }, registerData.token);

  await page.goto('/chat');
  await page.getByRole('button', { name: /新\s*建/ }).click();
  await expect(page.getByRole('heading', { name: '新会话 1' })).toBeVisible();

  await page.getByPlaceholder('输入消息...').fill('你好 Annie');
  await Promise.all([
    page.waitForResponse((response) =>
      /\/api\/v1\/chat\//.test(response.url()) && response.status() === 201,
    ),
    page.getByRole('button', { name: /发\s*送/ }).click(),
  ]);

  await expect(page.getByText('你好 Annie')).toBeVisible();
  await expect(page.getByText('这是 Annie 的回复（待集成真实 AI 服务）')).toBeVisible();
});
