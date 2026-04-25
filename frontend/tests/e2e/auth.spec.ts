import { expect, test } from '@playwright/test';

test('登录页可以打开并显示表单字段', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  await expect(page.getByLabel('邮箱')).toBeVisible();
  await expect(page.getByLabel('密码')).toBeVisible();
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
});

test('联系页可以打开并显示反馈表单', async ({ page }) => {
  await page.goto('/contact');

  await expect(page.getByRole('heading', { name: '与 Annie 团队取得联系' })).toBeVisible();
  await expect(page.getByLabel('主题')).toBeVisible();
  await expect(page.getByLabel('消息')).toBeVisible();
  await expect(page.getByRole('button', { name: '提交反馈' })).toBeVisible();
});
