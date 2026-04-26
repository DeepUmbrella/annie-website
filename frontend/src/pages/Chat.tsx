import { Button, Empty, Input, List, message, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import Section from '../components/common/Section';
import { streamChatMessage, getErrorMessage } from '../lib/chatStream';

type ChatMessage = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title?: string;
  messages: ChatMessage[];
};

const API = import.meta.env.VITE_API_URL || '';

const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  /** Text accumulated from SSE chunk events for the in-progress assistant draft */
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const token = useMemo(() => localStorage.getItem('token'), []);

  const fetchSessions = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/api/v1/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data);
      if (!activeSessionId && response.data.length > 0) {
        setActiveSessionId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, []);

  const activeSession = sessions.find((session) => session.id === activeSessionId) || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, streamingText]);

  const createSession = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${API}/api/v1/chat/sessions`,
        { title: `新会话 ${sessions.length + 1}` },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const next = [response.data, ...sessions];
      setSessions(next);
      setActiveSessionId(response.data.id);
    } catch (error: any) {
      message.error(error.message || '创建会话失败');
    }
  };

  const sendMessage = async () => {
    if (!token || !activeSessionId || !draft.trim() || sending) return;
    const content = draft.trim();
    setSending(true);
    setDraft('');

    const optimisticUserMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    };

    // Optimistic user message
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: [...(session.messages || []), optimisticUserMsg] }
          : session,
      ),
    );

    // Reset streaming state
    setStreamingText('');

    // Local variable captured by all callbacks — avoids stale closure over state
    let placeholderId: string | null = null;

    try {
      streamChatMessage(
        activeSessionId,
        token,
        content,
        {
          onStart: (requestId) => {
            placeholderId = `assistant-${requestId}`;
            // Create a placeholder assistant message entry
            const placeholder: ChatMessage = {
              id: placeholderId,
              role: 'ASSISTANT',
              content: '',
              createdAt: new Date().toISOString(),
            };

            setStreamingText('');
            setSessions((prev) =>
              prev.map((session) =>
                session.id === activeSessionId
                  ? { ...session, messages: [...(session.messages || []), placeholder] }
                  : session,
              ),
            );
          },
          onChunk: (text) => {
            setStreamingText((prev) => prev + text);
          },
          onDone: (fullText) => {
            if (!placeholderId) return;
            // Replace placeholder content with the full response
            setSessions((prev) =>
              prev.map((session) =>
                session.id === activeSessionId
                  ? {
                      ...session,
                      messages: (session.messages || []).map((msg) =>
                        msg.id === placeholderId ? { ...msg, content: fullText } : msg,
                      ),
                    }
                  : session,
              ),
            );
            setStreamingText('');
            placeholderId = null;
          },
          onError: (code, errMsg) => {
            const display = getErrorMessage(code, errMsg || '发送消息失败');
            message.error(display);
            // Always remove optimistic user message. Remove placeholder assistant
            // message only when placeholderId is set (i.e. onStart fired before error).
            // When placeholderId is null the error arrived before the SSE stream started
            // (e.g. HTTP 4xx/5xx); in that case only the optimistic user message must be
            // dropped so the UI stays clean.
            setSessions((prev) =>
              prev.map((session) =>
                session.id === activeSessionId
                  ? {
                      ...session,
                      messages: (session.messages || []).filter(
                        (msg) =>
                          !msg.id.startsWith('optimistic-') &&
                          (placeholderId === null || msg.id !== placeholderId),
                      ),
                    }
                  : session,
              ),
            );
            setStreamingText('');
            placeholderId = null;
          },
        },
      );
    } catch (error: any) {
      message.error(error.message || '发送消息失败');
      // Clean up optimistic user message on total failure
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                messages: (session.messages || []).filter(
                  (msg) => !msg.id.startsWith('optimistic-'),
                ),
              }
            : session,
        ),
      );
      setStreamingText('');
    } finally {
      setSending(false);
    }
  };

  if (!token) {
    return (
      <Section>
        <GlassCard className="mx-auto max-w-3xl p-12 text-center">
          <Empty description={<span className="text-white/72">请先登录后再使用对话功能</span>} />
        </GlassCard>
      </Section>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="Chat"
        title="Annie 对话工作区"
        description="创建会话并和 Annie 进行最小联调对话。"
      />

      <Section>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
          <GlassCard className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">会话</h2>
              <Button onClick={createSession} type="primary">新建</Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Spin /></div>
            ) : sessions.length === 0 ? (
              <Empty description={<span className="text-white/72">暂无会话</span>} />
            ) : (
              <List
                dataSource={sessions}
                renderItem={(session) => (
                  <List.Item className="!border-none !px-0 !py-1">
                    <button
                      onClick={() => setActiveSessionId(session.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left transition ${session.id === activeSessionId ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/75 hover:bg-white/[0.06]'}`}
                    >
                      <div className="font-medium">{session.title || 'New Chat'}</div>
                      <div className="text-xs opacity-70">{session.messages?.length || 0} 条消息</div>
                    </button>
                  </List.Item>
                )}
              />
            )}
          </GlassCard>

          <GlassCard className="p-6">
            {!activeSession ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <Empty description={<span className="text-white/72">请选择或创建一个会话</span>} />
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">{activeSession.title || 'New Chat'}</h2>
                <div className="min-h-[320px] max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4">
                  {activeSession.messages?.length ? activeSession.messages.map((item) => (
                    <div key={item.id} className={`rounded-2xl px-4 py-3 text-sm leading-7 ${item.role === 'USER' ? 'chat-message-user ml-auto max-w-[85%] bg-annie-cyan/15 text-white' : 'chat-message-assistant mr-auto max-w-[85%] bg-white/[0.06] text-white/85'}`}>
                      <div className="mb-1 text-xs opacity-60">{item.role === 'USER' ? '你' : 'Annie'}</div>
                      <div>{item.content}</div>
                    </div>
                  )) : (
                    <Empty description={<span className="text-white/72">还没有消息，发一条试试</span>} />
                  )}
                  {/* Streaming draft — renders while SSE chunks arrive */}
                  {streamingText && (
                    <div className="chat-message-assistant mr-auto max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/85">
                      <div className="mb-1 text-xs opacity-60">Annie</div>
                      <div>{streamingText}</div>
                    </div>
                  )}
                  {sending && !streamingText && (
                    <div className="chat-message-assistant mr-auto max-w-[85%] rounded-2xl bg-white/[0.06] px-4 py-3 text-sm leading-7 text-white/50">
                      <div className="mb-1 text-xs opacity-60">Annie</div>
                      <div>正在回复...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-3">
                  <Input.TextArea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={3}
                    placeholder="输入消息..."
                  />
                  <Button type="primary" loading={sending} onClick={sendMessage} className="self-end">
                    发送
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </Section>
    </div>
  );
};

export default Chat;
