import { expect, test } from '@playwright/test';

test('真实登录流程可用并写入 token', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `e2e_user_${nonce}`,
    email: `e2e_${nonce}@linany.com`,
    password: 'Test123456',
  };

  const registerResponse = await request.post('http://127.0.0.1:3001/api/v1/auth/register', {
    data: user,
  });
  expect(registerResponse.ok()).toBeTruthy();

  await page.goto('/login');
  await page.getByLabel('邮箱').fill(user.email);
  await page.getByLabel('密码').fill(user.password);

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/login') && response.status() === 201,
    ),
    page.locator('form').evaluate((form) => (form as HTMLFormElement).requestSubmit()),
  ]);

  await expect(page.getByRole('button', { name: user.username })).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
});

test('反馈表单可以成功提交到后端', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `feedback_user_${nonce}`,
    email: `feedback_${nonce}@linany.com`,
    password: 'Test123456',
  };

  const registerResponse = await request.post('http://127.0.0.1:3001/api/v1/auth/register', {
    data: user,
  });
  expect(registerResponse.ok()).toBeTruthy();
  const registerData = await registerResponse.json();

  await page.addInitScript((token) => {
    window.localStorage.setItem('token', token as string);
  }, registerData.token);

  await page.goto('/contact');
  await page.getByLabel('主题').fill('E2E 反馈测试');
  await page.getByLabel('消息').fill('这是一条来自 Playwright 的联调反馈。');

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/v1/feedback') && response.status() === 201,
    ),
    page.locator('form').evaluate((form) => (form as HTMLFormElement).requestSubmit()),
  ]);

  await expect(page.getByLabel('主题')).toHaveValue('');
});

test('Docs 搜索可以请求后端并显示结果', async ({ page }) => {
  await page.goto('/docs');

  await page.getByPlaceholder('搜索文档...').fill('api');
  await expect(page.getByRole('heading', { name: '搜索结果' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '认证 API' })).toBeVisible();
});
