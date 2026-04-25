import { expect, test } from '@playwright/test';

test('首页可以打开并显示核心文案', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /成为你的智能协作中枢/ })).toBeVisible();
  await expect(page.getByRole('link', { name: '立即体验' })).toBeVisible();
  await expect(page.getByText('AI Assistant Platform')).toBeVisible();
});

test('首页导航可以跳转到文档页', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: '查看文档' }).first().click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.getByRole('heading', { name: '开发者文档' })).toBeVisible();
});
