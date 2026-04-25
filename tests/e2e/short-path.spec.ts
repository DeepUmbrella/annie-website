import { expect, test } from '@playwright/test';

test('Profile 页面可以加载并保存资料', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `profile_user_${nonce}`,
    email: `profile_${nonce}@linany.com`,
    password: 'Test123456',
  };

  const registerResponse = await request.post('http://127.0.0.1:3001/api/v1/auth/register', { data: user });
  expect(registerResponse.ok()).toBeTruthy();
  const registerData = await registerResponse.json();

  await page.addInitScript((token) => {
    window.localStorage.setItem('token', token as string);
  }, registerData.token);

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: '个人资料' })).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();

  await page.getByLabel('显示名称').fill('E2E Profile');
  await page.getByLabel('简介').fill('这是一段测试简介');

  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/v1/auth/profile') && response.status() === 200,
    ),
    page.getByRole('button', { name: '保存资料' }).click(),
  ]);

  await expect(page.getByLabel('显示名称')).toHaveValue('E2E Profile');
});

test('Chat 页面支持回车发送消息', async ({ page, request }) => {
  const nonce = Date.now();
  const user = {
    username: `chat_enter_user_${nonce}`,
    email: `chat_enter_${nonce}@linany.com`,
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
  await page.getByPlaceholder('输入消息...').fill('回车发送测试');

  await Promise.all([
    page.waitForResponse((response) =>
      /\/api\/v1\/chat\//.test(response.url()) && response.status() === 201,
    ),
    page.getByPlaceholder('输入消息...').press('Enter'),
  ]);

  await expect(page.getByText('回车发送测试')).toBeVisible();
});
