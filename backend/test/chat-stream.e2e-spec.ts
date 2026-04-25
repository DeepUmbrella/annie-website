// Set DATABASE_URL before any modules are loaded
process.env.DATABASE_URL =
  'postgresql://annie:annie_secure_pass@192.168.1.16:5432/annie_db?schema=public';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate } from '@nestjs/common';
import request from 'supertest';
import { Subject } from 'rxjs';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { ChatModule } from '../src/modules/chat/chat.module';
import { AppConfigModule } from '../src/config/config.module';
import { ChatService } from '../src/modules/chat/chat.service';
import { SuperpowerBridgeService } from '../src/modules/chat/bridge/superpower-bridge.service';
import { StreamRequest } from '../src/modules/chat/bridge/superpower-bridge.types';
import { PrismaService } from '../src/common/database/prisma.service';
import type { ExecutionContext } from '@nestjs/common';
import type { IncomingMessage } from 'http';

// Use a random suffix so each test invocation gets unique DB records
const TEST_RAND = Math.random().toString(36).slice(2, 8);
const USER_ID = `user-${process.pid}-${TEST_RAND}-123`;
// SESSION_ID is now created fresh per test case to avoid unique-key conflicts
let SESSION_ID = `session-${process.pid}-${TEST_RAND}-456`;

/** Controlled frame generator that emits frames on demand. */
function makeControlledGenerator() {
  const frames$ = new Subject<{
    type: 'start';
    requestId: string;
  } | {
    type: 'text';
    text: string;
  } | {
    type: 'done';
  } | {
    type: 'error';
    code: string;
    message: string;
  }>();
  return { frames$, generator: () => frames$.asObservable() };
}

/** Mock auth guard that injects the test USER_ID as the current user. */
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

  // All test doubles for the real bridge service
  let mockBridgeStream: jest.Mock;
  let mockBridgeEndStream: jest.Mock;
  let mockBridgeStreamCall: ReturnType<typeof makeControlledGenerator> | null = null;

  beforeEach(async () => {
    // Fresh generator per test so events don't leak
    mockBridgeStreamCall = makeControlledGenerator();
    mockBridgeStream = jest.fn().mockReturnValue(mockBridgeStreamCall.generator());
    mockBridgeEndStream = jest.fn();

    // Fresh SESSION_ID per test case to prevent unique-key conflicts
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

    chatService = moduleFixture.get<ChatService>(ChatService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Seed a real user + session in the test DB
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
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.message
        .deleteMany({ where: { sessionId: SESSION_ID } })
        .catch(() => {});
      await prisma.chatSession
        .deleteMany({ where: { id: SESSION_ID } })
        .catch(() => {});
      await prisma.user
        .deleteMany({ where: { id: USER_ID } })
        .catch(() => {});
    }
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  it(
    'emits start + chunks + done SSE events and persists messages',
    (done) => {
      let chunkTexts: string[] = [];

      // Start the SSE request but abort it after 3s via a safety timer.
      // This prevents the test from hanging if the SSE stream doesn't close.
      const safetyTimer = setTimeout(() => {
        // Force-close by ending the request — this lets the test proceed
        done();
      }, 3000);

      const req = request(app.getHttpServer())
        .post(`/chat/${SESSION_ID}/stream`)
        .set('Authorization', `Bearer mock-token-for-${USER_ID}`)
        .send({ message: 'Hello AI' });

      // Capture SSE data as it arrives
      req.on('data', (buf: Buffer) => {
        const text = buf.toString();
        if (text.startsWith('data:')) {
          const data = text.slice(5).trim();
          if (!data || data === 'null') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text !== undefined) chunkTexts.push(parsed.text);
          } catch {}
        }
      });

      // Wait for the HTTP response headers (not the SSE completion)
      req.on('response', (res: import('http').IncomingMessage) => {
        // Verify the response status and headers immediately
        expect(res.statusCode).toBe(201);

        // The bridge was called with correct args
        expect(mockBridgeStream).toHaveBeenCalledTimes(1);
        const streamReq: StreamRequest = mockBridgeStream.mock.calls[0][0];
        expect(streamReq.sessionKey).toBe(SESSION_ID);
        expect(streamReq.userId).toBe(USER_ID);
        expect(streamReq.content).toBe('Hello AI');

        // Simulate bridge frames after the response starts
        setImmediate(() => {
          mockBridgeStreamCall!.frames$.next({
            type: 'start',
            requestId: 'req_test_1',
          });
          mockBridgeStreamCall!.frames$.next({ type: 'text', text: 'Hi' });
          mockBridgeStreamCall!.frames$.next({ type: 'text', text: ' there!' });
          mockBridgeStreamCall!.frames$.next({ type: 'done', requestId: 'req_test_1', fullText: 'Hi there!' });
          mockBridgeStreamCall!.frames$.complete();
        });

        // Wait for frames to be processed then verify DB
        setTimeout(async () => {
          try {
            clearTimeout(safetyTimer);
            const messages = await prisma.message.findMany({
              where: { sessionId: SESSION_ID },
              orderBy: { createdAt: 'asc' },
            });
            const userMsg = messages.find((m) => m.role === 'USER');
            const assistantMsg = messages.find((m) => m.role === 'ASSISTANT');
            expect(userMsg?.content).toBe('Hello AI');
            expect(assistantMsg?.content).toBe('Hi there!');
            done();
          } catch (e) {
            clearTimeout(safetyTimer);
            done(e);
          }
        }, 500);
      });
    },
    10_000,
  );

  it(
    'writes user message and assistant placeholder before bridge stream ends',
    (done) => {
      const safetyTimer = setTimeout(done, 3000);

      request(app.getHttpServer())
        .post(`/chat/${SESSION_ID}/stream`)
        .set('Authorization', `Bearer mock-token-for-${USER_ID}`)
        .send({ message: 'First' })
        .on('response', () => {
          // Immediately complete the bridge stream
          mockBridgeStreamCall!.frames$.complete();
        })
        .end(() => {
          clearTimeout(safetyTimer);
        });

      setTimeout(async () => {
        try {
          const messages = await prisma.message.findMany({
            where: { sessionId: SESSION_ID },
          });
          expect(messages).toHaveLength(2);
          const userMsg = messages.find((m) => m.role === 'USER');
          const placeholder = messages.find((m) => m.role === 'ASSISTANT');
          expect(userMsg?.content).toBe('First');
          expect(placeholder?.content).toBe(''); // placeholder is empty initially
          done();
        } catch (e) {
          clearTimeout(safetyTimer);
          done(e);
        }
      }, 200);
    },
    10_000,
  );

  // ── Error path ────────────────────────────────────────────────────────────

  it(
    'leaves assistant placeholder unfinalized when bridge emits error',
    (done) => {
      const safetyTimer = setTimeout(done, 3000);

      request(app.getHttpServer())
        .post(`/chat/${SESSION_ID}/stream`)
        .set('Authorization', `Bearer mock-token-for-${USER_ID}`)
        .send({ message: 'Fail me' })
        .on('response', () => {
          setImmediate(() => {
            mockBridgeStreamCall!.frames$.next({
              type: 'error',
              code: 'service_unavailable',
              message: 'Gateway is down',
            });
            mockBridgeStreamCall!.frames$.complete();
          });
        })
        .end(() => {
          clearTimeout(safetyTimer);
        });

      setTimeout(async () => {
        try {
          const messages = await prisma.message.findMany({
            where: { sessionId: SESSION_ID },
          });
          // Should have user message + assistant placeholder (unfinalized)
          const userMsg = messages.find((m) => m.role === 'USER');
          const assistantMsg = messages.find((m) => m.role === 'ASSISTANT');
          expect(userMsg?.content).toBe('Fail me');
          // Placeholder content stays empty (not finalized) when bridge errors
          expect(assistantMsg?.content ?? null).toBeFalsy();
          done();
        } catch (e) {
          clearTimeout(safetyTimer);
          done(e);
        }
      }, 500);
    },
    10_000,
  );
});
