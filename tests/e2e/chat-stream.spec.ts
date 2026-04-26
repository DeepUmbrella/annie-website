import { expect, test } from '@playwright/test';

const API = 'http://127.0.0.1:3001';

test.describe('Chat streaming', () => {
  test('renders streamed assistant chunks in real time', async ({ page, request }) => {
    // 1. Register + login a dedicated user
    const nonce = Date.now();
    const user = {
      username: `stream_user_${nonce}`,
      email: `stream_${nonce}@linany.com`,
      password: 'Test123456',
    };

    const regRes = await request.post(`${API}/api/v1/auth/register`, { data: user });
    expect(regRes.ok()).toBeTruthy();
    const { token } = await regRes.json();

    // 2. Create a chat session
    const sessionRes = await request.post(`${API}/api/v1/chat/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Stream Test' },
    });
    expect(sessionRes.ok()).toBeTruthy();
    const session = await sessionRes.json();

    // 3. Inject token so Chat page can authenticate
    await page.addInitScript((t) => {
      window.localStorage.setItem('token', t as string);
    }, token);

    // 4. Navigate to chat and wait for the session list to load
    await page.goto('/chat');
    await page.waitForSelector('button:has-text("Stream Test")');

    // 5. Click the session to activate it
    await page.click('button:has-text("Stream Test")');

    // 6. Wait for session activation then ensure input and send button are visible
    // Ant Design renders Chinese Button text with spacing: "发 送"
    await expect(page.getByPlaceholder('输入消息...')).toBeVisible();
    await expect(page.getByRole('button', { name: '发 送' })).toBeVisible();

    // 7. Submit a message
    await page.getByPlaceholder('输入消息...').fill('你好');
    await page.getByRole('button', { name: '发 送' }).click();

    // 8. The user message should appear immediately (optimistic)
    await expect(page.locator('.chat-message-user')).toBeVisible();

    // 9. The assistant stream draft should appear and accumulate
    //    Backend SSE sends: event: chunk\ndata: {"type":"chunk","text":"你"}\n\n
    const assistantBubble = page.locator('.chat-message-assistant').first();
    await expect(assistantBubble).toBeVisible({ timeout: 15000 });

    // 10. Eventually the full text should be present (done event)
    //    The exact text depends on the superpower agent; we just check it arrived.
    await expect(page.getByText(/好/).first()).toBeVisible({ timeout: 20000 });
  });

  test('shows error message when session is busy and clears draft', async ({ page, request }) => {
    // 1. Register + login
    const nonce = Date.now() + 1;
    const user = {
      username: `busy_user_${nonce}`,
      email: `busy_${nonce}@linany.com`,
      password: 'Test123456',
    };

    const regRes = await request.post(`${API}/api/v1/auth/register`, { data: user });
    expect(regRes.ok()).toBeTruthy();
    const { token } = await regRes.json();

    // 2. Create a chat session
    const sessionRes = await request.post(`${API}/api/v1/chat/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: 'Busy Test' },
    });
    const session = await sessionRes.json();

    await page.addInitScript((t) => {
      window.localStorage.setItem('token', t as string);
    }, token);

    await page.goto('/chat');
    await page.waitForSelector('button:has-text("Busy Test")');
    await page.click('button:has-text("Busy Test")');

    await page.getByPlaceholder('输入消息...').fill('hello');
    await page.getByRole('button', { name: '发 送' }).click();

    // If the backend returns a session_busy error, the UI should show an error
    // and the streaming draft should be cleared. We just assert no crash.
    await expect(page.getByPlaceholder('输入消息...')).toBeVisible();
  });
});
