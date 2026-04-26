export type StreamEvent =
  | { type: 'start'; requestId: string }
  | { type: 'chunk'; requestId: string; text: string }
  | { type: 'done'; requestId: string; fullText: string }
  | { type: 'error'; requestId: string; code: string; message: string };

export type StreamCallbacks = {
  onStart?: (requestId: string) => void;
  onChunk?: (text: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (code: string, message: string) => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  session_busy: '对话正忙，请稍后再试',
  timeout: '响应超时，请重试',
  service_unavailable: '服务暂不可用，请稍后再试',
  upstream_error: '上游服务出错，请稍后重试',
};

export function getErrorMessage(code: string, fallback: string): string {
  return ERROR_MESSAGES[code] ?? fallback;
}

/**
 * Opens a SSE connection to the backend streaming endpoint and calls
 * the appropriate callbacks as events arrive.
 *
 * @param sessionId  The chat session ID
 * @param token      Auth token (Bearer)
 * @param message    The user's message
 * @param callbacks  Event handlers
 * @returns The underlying AbortController so callers can cancel the stream
 */
export function streamChatMessage(
  sessionId: string,
  token: string,
  message: string,
  callbacks: StreamCallbacks,
): AbortController {
  const controller = new AbortController();

  const apiUrl = (import.meta.env.VITE_API_URL as string) || '';

  const url = `${apiUrl}/api/v1/chat/${sessionId}/stream`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok || !response.body) {
        const text = await response.text().catch(() => '');
        callbacks.onError?.('upstream_error', `HTTP ${response.status}: ${text}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the potentially incomplete last line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.slice(6).trim();
            void eventType; // consumed together with the next data: line
          }
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (!dataStr) continue;

            let event: StreamEvent;
            try {
              event = JSON.parse(dataStr) as StreamEvent;
            } catch {
              continue;
            }

            switch (event.type) {
              case 'start':
                callbacks.onStart?.(event.requestId);
                break;
              case 'chunk':
                callbacks.onChunk?.(event.text);
                break;
              case 'done':
                callbacks.onDone?.(event.fullText);
                break;
              case 'error':
                callbacks.onError?.(event.code, event.message);
                break;
            }
          }
        }
      }
    })
    .catch((err: Error) => {
      if (err.name === 'AbortError') return;
      callbacks.onError?.('upstream_error', err.message);
    });

  return controller;
}
