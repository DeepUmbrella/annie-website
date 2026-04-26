// Set DATABASE_URL before any modules are loaded
process.env.DATABASE_URL =
  'postgresql://annie:annie_secure_pass@192.168.1.16:5432/annie_db?schema=public';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate } from '@nestjs/common';
import { Subject } from 'rxjs';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { ChatModule } from '../src/modules/chat/chat.module';
import { AppConfigModule } from '../src/config/config.module';
import { ChatService } from '../src/modules/chat/chat.service';
import { SuperpowerBridgeService } from '../src/modules/chat/bridge/superpower-bridge.service';
import { StreamRequest } from '../src/modules/chat/bridge/superpower-bridge.service';
import { BridgeStreamEvent } from '../src/modules/chat/bridge/superpower-bridge.types';
import { PrismaService } from '../src/common/database/prisma.service';
import type { ExecutionContext } from '@nestjs/common';
import type { IncomingMessage } from 'http';

const TEST_RAND = Math.random().toString(36).slice(2, 8);
const USER_ID = `user-${process.pid}-${TEST_RAND}-123`;
let SESSION_ID = `session-${process.pid}-${TEST_RAND}-456`;

type ParsedStreamResponse = {
  statusCode: number;
  raw: string;
};

function makeControlledGenerator() {
  const frames$ = new Subject<BridgeStreamEvent>();
  return { frames$, generator: () => frames$.asObservable() };
}

function mockAuthGuard(userId: string): CanActivate {
  return {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest<IncomingMessage>();
      (req as IncomingMessage & { user: { userId: string } }).user = { userId };
      return true;
    },
  };
}

describe('ChatController (e2e) — streaming endpoint', () => {
  let app: INestApplication;
  let chatService: ChatService;
  let prisma: PrismaService;

  let mockBridgeStream: jest.Mock;
  let mockBridgeEndStream: jest.Mock;
  let mockBridgeStreamCall: ReturnType<typeof makeControlledGenerator> | null = null;
  let baseUrl: string;

  const requestStream = async (
    message: string,
    onOpen?: (res: Response) => void,
  ): Promise<ParsedStreamResponse> => {
    const response = await fetch(`${baseUrl}/chat/${SESSION_ID}/stream`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer mock-token-for-${USER_ID}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    onOpen?.(response);

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('SSE response body is not readable');
    }

    const decoder = new TextDecoder();
    let raw = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
    }

    raw += decoder.decode();

    return {
      statusCode: response.status,
      raw,
    };
  };

  beforeEach(async () => {
    mockBridgeStreamCall = makeControlledGenerator();
    mockBridgeStream = jest.fn().mockReturnValue(mockBridgeStreamCall.generator());
    mockBridgeEndStream = jest.fn();

    SESSION_ID = `session-${process.pid}-${TEST_RAND}-${Date.now()}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule, ChatModule],
    })
      .overrideProvider(SuperpowerBridgeService)
      .useValue({
        stream: mockBridgeStream,
        endStream: mockBridgeEndStream,
        initialize: jest.fn(),
        ensureDedicatedSession: jest.fn(),
        closeDedicatedSession: jest.fn(),
      })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard(USER_ID))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0);
    baseUrl = await app.getUrl();

    chatService = moduleFixture.get<ChatService>(ChatService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: {
        id: USER_ID,
        username: `testuser_${process.pid}_${TEST_RAND}`,
        email: `test_${process.pid}_${TEST_RAND}@test.com`,
        passwordHash: 'hash',
      },
    });
    await prisma.chatSession.create({
      data: { id: SESSION_ID, userId: USER_ID, title: 'Test Chat' },
    });
  }, 15_000);

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.message.deleteMany({ where: { sessionId: SESSION_ID } }).catch(() => {});
      await prisma.chatSession.deleteMany({ where: { id: SESSION_ID } }).catch(() => {});
      await prisma.user.deleteMany({ where: { id: USER_ID } }).catch(() => {});
    }
  }, 15_000);

  it('emits start + chunks + done SSE events and persists messages', async () => {
    const response = await requestStream('Hello AI', () => {
      setImmediate(() => {
        mockBridgeStreamCall!.frames$.next({
          type: 'start',
          requestId: 'req_test_1',
        });
        mockBridgeStreamCall!.frames$.next({
          type: 'chunk',
          requestId: 'req_test_1',
          text: 'Hi',
        });
        mockBridgeStreamCall!.frames$.next({
          type: 'chunk',
          requestId: 'req_test_1',
          text: ' there!',
        });
        mockBridgeStreamCall!.frames$.next({
          type: 'done',
          requestId: 'req_test_1',
          fullText: 'Hi there!',
        });
        mockBridgeStreamCall!.frames$.complete();
      });
    });

    expect(response.statusCode).toBe(201);
    expect(response.raw).toContain('event: start');
    expect(response.raw).toContain('event: chunk');
    expect(response.raw).toContain('event: done');
    expect(response.raw).toContain('Hi there!');

    expect(mockBridgeStream).toHaveBeenCalledTimes(1);
    const streamReq: StreamRequest = mockBridgeStream.mock.calls[0][0];
    expect(streamReq.sessionKey).toBe(SESSION_ID);
    expect(streamReq.userId).toBe(USER_ID);
    expect(streamReq.content).toBe('Hello AI');

    const messages = await prisma.message.findMany({
      where: { sessionId: SESSION_ID },
      orderBy: { createdAt: 'asc' },
    });
    const userMsg = messages.find((m) => m.role === 'USER');
    const assistantMsg = messages.find((m) => m.role === 'ASSISTANT');
    expect(userMsg?.content).toBe('Hello AI');
    expect(assistantMsg?.content).toBe('Hi there!');
  }, 15_000);

  it('writes user message and assistant placeholder before bridge stream ends', async () => {
    const response = await requestStream('First', () => {
      setImmediate(() => {
        mockBridgeStreamCall!.frames$.complete();
      });
    });

    expect(response.statusCode).toBe(201);

    const messages = await prisma.message.findMany({
      where: { sessionId: SESSION_ID },
      orderBy: { createdAt: 'asc' },
    });
    expect(messages).toHaveLength(2);
    const userMsg = messages.find((m) => m.role === 'USER');
    const placeholder = messages.find((m) => m.role === 'ASSISTANT');
    expect(userMsg?.content).toBe('First');
    expect(placeholder?.content).toBe('');
  }, 15_000);

  it('leaves assistant placeholder unfinalized when bridge emits error', async () => {
    const response = await requestStream('Fail me', () => {
      setImmediate(() => {
        mockBridgeStreamCall!.frames$.error({
          type: 'error',
          requestId: 'req_test_err',
          code: 'service_unavailable',
          message: 'Gateway is down',
        });
      });
    });

    expect(response.statusCode).toBe(201);
    expect(response.raw).toContain('event: error');
    expect(response.raw).toContain('Gateway is down');

    const messages = await prisma.message.findMany({
      where: { sessionId: SESSION_ID },
      orderBy: { createdAt: 'asc' },
    });
    const userMsg = messages.find((m) => m.role === 'USER');
    const assistantMsg = messages.find((m) => m.role === 'ASSISTANT');
    expect(userMsg?.content).toBe('Fail me');
    expect(assistantMsg?.content ?? null).toBeFalsy();
  }, 15_000);
});
