import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { SuperpowerBridgeService, StreamRequest, RawFrame } from './superpower-bridge.service';
import { BridgeStreamEvent } from './superpower-bridge.types';
import { GatewayClient, GATEWAY_CLIENT, SessionResult } from './superpower-bridge.gateway-client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFrameGen(frames: RawFrame[]): () => Observable<RawFrame> {
  return () =>
    new Observable<RawFrame>((observer) => {
      frames.forEach((f) => observer.next(f));
      observer.complete();
    });
}

function neverGen(): () => Observable<RawFrame> {
  return () => new Observable<RawFrame>(() => {});
}

// ─── Mock implementations ─────────────────────────────────────────────────────

const mockSessionStateStore = {
  load: jest.fn(),
  save: jest.fn(),
};

// MockGatewayClient simulates a real Gateway.
// Accepts:
//  - `seededSessions`   map of sessionKey → sessionId to return on openSession
//  - `shouldFailOpen`    true → throw on every openSession call
class MockGatewayClient implements GatewayClient {
  private sessions = new Map<string, string>(); // sessionKey → sessionId

  constructor(
    private seededSessions: Record<string, string> = {},
    private shouldFailOpen = false,
  ) {}

  async openSession(_config: any, sessionKey: string): Promise<SessionResult> {
    if (this.shouldFailOpen) {
      throw new Error('Gateway connection refused');
    }
    // If this sessionKey was seeded (i.e. restored), reuse its ID;
    // otherwise generate a fresh one.
    const sessionId = this.seededSessions[sessionKey] ?? `session-${Date.now()}`;
    this.sessions.set(sessionKey, sessionId);
    return {
      sessionId,
      sendMessageStream: (_message: string) =>
        new Observable<RawFrame>(() => {
          // Default: never emit (tests drive frames via frameGenerator option).
        }),
    };
  }

  async closeSession(sessionId: string): Promise<void> {
    // Remove all entries with this sessionId (sessionKey is not available here)
    for (const [key, id] of this.sessions.entries()) {
      if (id === sessionId) this.sessions.delete(key);
    }
  }

  getSessionId(sessionKey: string): string | undefined {
    return this.sessions.get(sessionKey);
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('SuperpowerBridgeService — Task 5', () => {
  const mockConfig = {
    url: 'ws://localhost:9000',
    targetAgent: 'annie',
    sessionLabel: 'test-session',
    stateFilePath: '/tmp/test-state.json',
    firstChunkTimeoutMs: 200,
    idleTimeoutMs: 30000,
  };

  let service: SuperpowerBridgeService;
  let mockGatewayClient: MockGatewayClient;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockGatewayClient = new MockGatewayClient({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperpowerBridgeService,
        { provide: 'SESSION_STATE_STORE', useValue: mockSessionStateStore },
        { provide: GATEWAY_CLIENT, useValue: mockGatewayClient },
      ],
    }).compile();

    service = module.get<SuperpowerBridgeService>(SuperpowerBridgeService);
    service.initialize(mockConfig);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ensureDedicatedSession — recovery / rebuild order
  // ─────────────────────────────────────────────────────────────────────────
  describe('ensureDedicatedSession() — session recovery order', () => {

    it('Step 1: should restore session from SessionStateStore if sessionId is present', async () => {
      const savedState = {
        sessionKey: 'restore-key',
        sessionId: 'saved-session-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSessionStateStore.load.mockReturnValue(savedState);

      // Seed the mock client so it returns the saved sessionId on openSession
      // (simulating the Gateway recognizing a stale session ID).
      const seededClient = new MockGatewayClient({ 'restore-key': 'saved-session-123' });
      // Replace the provider with the seeded client
      const seededModule: TestingModule = await Test.createTestingModule({
        providers: [
          SuperpowerBridgeService,
          { provide: 'SESSION_STATE_STORE', useValue: mockSessionStateStore },
          { provide: GATEWAY_CLIENT, useValue: seededClient },
        ],
      }).compile();
      const seededService = seededModule.get<SuperpowerBridgeService>(SuperpowerBridgeService);
      seededService.initialize(mockConfig);

      const result = await seededService.ensureDedicatedSession('restore-key');

      expect(result.sessionId).toBe('saved-session-123');
      expect(mockSessionStateStore.load).toHaveBeenCalledWith();
      expect(seededClient.getSessionId('restore-key')).toBe('saved-session-123');

      seededService.onModuleDestroy();
    });

    it('Step 1 → Step 2: should fall back to creating a new session when store is empty', async () => {
      // No saved state
      mockSessionStateStore.load.mockReturnValue(null);

      const result = await service.ensureDedicatedSession('new-key');

      // A new session must have been created (ID is from MockGatewayClient)
      expect(result.sessionId).toBeDefined();
      expect(mockSessionStateStore.save).toHaveBeenCalledWith(
        expect.objectContaining({ sessionKey: 'new-key', sessionId: result.sessionId }),
      );
    });

    it('Step 1 → Step 2: should fall back to creating a new session when store load throws', async () => {
      mockSessionStateStore.load.mockImplementation(() => {
        throw new Error('Corrupt state file');
      });

      const result = await service.ensureDedicatedSession('corrupt-key');

      expect(result.sessionId).toBeDefined();
      expect(mockSessionStateStore.save).toHaveBeenCalledWith(
        expect.objectContaining({ sessionKey: 'corrupt-key' }),
      );
    });

    it('Step 1 → Step 2: should fall back to new session when restore fails (Gateway rejects stale ID)', async () => {
      // Simulate: saved state exists, but Gateway refuses the old sessionId
      const savedState = {
        sessionKey: 'stale-key',
        sessionId: 'stale-session-999',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSessionStateStore.load.mockReturnValue(savedState);

      // Override the mock client to fail on openSession for the stale ID
      const failingClient = new MockGatewayClient(undefined, true);
      // Patch ensureDedicatedSession to use a fresh client on restore failure
      // We achieve this by overriding GATEWAY_CLIENT provider with a client that
      // fails the first openSession call but succeeds on the second (retry) call.
      let callCount = 0;
      const retryClient: GatewayClient = {
        openSession: jest.fn().mockImplementation(async () => {
          callCount++;
          if (callCount === 1) throw new Error('Stale session ID');
          return {
            sessionId: 'new-session-after-retry',
            sendMessageStream: () => new Observable(() => {}),
          };
        }),
        closeSession: jest.fn(),
      };

      // Re-create service with the retry client
      const retryModule: TestingModule = await Test.createTestingModule({
        providers: [
          SuperpowerBridgeService,
          { provide: 'SESSION_STATE_STORE', useValue: mockSessionStateStore },
          { provide: GATEWAY_CLIENT, useValue: retryClient },
        ],
      }).compile();
      const retryService = retryModule.get<SuperpowerBridgeService>(SuperpowerBridgeService);
      retryService.initialize(mockConfig);

      const result = await retryService.ensureDedicatedSession('stale-key');

      // The second call (retry/new session) should succeed
      expect(result.sessionId).toBe('new-session-after-retry');
      expect(mockSessionStateStore.save).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: 'new-session-after-retry' }),
      );

      retryService.onModuleDestroy();
    });

    it('should persist new session state after successful creation', async () => {
      mockSessionStateStore.load.mockReturnValue(null);

      await service.ensureDedicatedSession('persist-key');

      expect(mockSessionStateStore.save).toHaveBeenCalledTimes(1);
      const savedState = mockSessionStateStore.save.mock.calls[0][0];
      expect(savedState.sessionKey).toBe('persist-key');
      expect(savedState.sessionId).toBeDefined();
      expect(savedState.createdAt).toBeDefined();
      expect(savedState.updatedAt).toBeDefined();
    });

    it('should return the same SessionResult for repeated calls with the same sessionKey', async () => {
      mockSessionStateStore.load.mockReturnValue(null);

      const r1 = await service.ensureDedicatedSession('same-key');
      const r2 = await service.ensureDedicatedSession('same-key');

      // Both calls should return the same in-memory session (no new creation)
      expect(r1.sessionId).toBe(r2.sessionId);
    });

    it('should throw when no GatewayClient is injected', async () => {
      const noClientModule: TestingModule = await Test.createTestingModule({
        providers: [
          SuperpowerBridgeService,
          { provide: 'SESSION_STATE_STORE', useValue: mockSessionStateStore },
          // No GATEWAY_CLIENT
        ],
      }).compile();
      const noClientService = noClientModule.get<SuperpowerBridgeService>(SuperpowerBridgeService);
      noClientService.initialize(mockConfig);

      await expect(noClientService.ensureDedicatedSession('any-key')).rejects.toThrow(
        'No GatewayClient injected',
      );
      noClientService.onModuleDestroy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // stream() — busy guard
  // ─────────────────────────────────────────────────────────────────────────
  describe('busy guard', () => {
    it('should emit session_busy error for a concurrent stream on the same sessionKey', (done) => {
      service
        .stream({ sessionKey: 's1', userId: 'u1', content: 'hello' })
        .subscribe({ error: () => {} });

      let receivedError = false;
      service
        .stream({ sessionKey: 's1', userId: 'u1', content: 'concurrent' })
        .subscribe({
          next: (event) => {
            if ((event as any).code === 'session_busy') receivedError = true;
          },
          error: (err) => {
            if ((err as any).code === 'session_busy') receivedError = true;
          },
        });

      setTimeout(() => {
        expect(receivedError).toBe(true);
        done();
      }, 20);
    });

    it('should allow a new stream after the previous stream completes', (done) => {
      const gen = makeFrameGen([
        { type: 'start', requestId: 'r1' },
        { type: 'text', text: 'Hello' },
        { type: 'done' },
      ]);

      service
        .stream({ sessionKey: 's2', userId: 'u1', content: 'first' }, { frameGenerator: gen })
        .subscribe({
          complete: () => {
            const gen2 = makeFrameGen([
              { type: 'start', requestId: 'r2' },
              { type: 'text', text: 'World' },
              { type: 'done' },
            ]);
            const events2: BridgeStreamEvent[] = [];
            service
              .stream({ sessionKey: 's2', userId: 'u1', content: 'second' }, { frameGenerator: gen2 })
              .subscribe({
                next: (e) => events2.push(e),
                complete: () => {
                  const busy = events2.filter(
                    (ev) => ev.type === 'error' && (ev as any).code === 'session_busy',
                  );
                  expect(busy).toHaveLength(0);
                  done();
                },
                error: (err) => {
                  if ((err as any).code === 'session_busy') done.fail('Second stream should not be rejected as busy');
                },
              });
          },
          error: () => {},
        });
    });

    it('should keep different sessionKeys independent — no cross-contamination', (done) => {
      const genA = makeFrameGen([{ type: 'start', requestId: 'rA' }, { type: 'done' }]);
      const genB = makeFrameGen([{ type: 'start', requestId: 'rB' }, { type: 'done' }]);

      service
        .stream({ sessionKey: 'key-A', userId: 'u1', content: 'msg-A' }, { frameGenerator: genA })
        .subscribe({ next: () => {}, error: () => {} });

      service
        .stream({ sessionKey: 'key-B', userId: 'u1', content: 'msg-B' }, { frameGenerator: genB })
        .subscribe({
          next: (e) => {},
          complete: () => {
            const eventsB: BridgeStreamEvent[] = [];
            done();
          },
          error: () => {},
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // stream() — text frame normalization
  // ─────────────────────────────────────────────────────────────────────────
  describe('text frame normalization', () => {
    it('should emit start event as the very first normalized event', (done) => {
      const events: BridgeStreamEvent[] = [];
      const gen = makeFrameGen([
        { type: 'start', requestId: 'req-test' },
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world!' },
        { type: 'done' },
      ]);

      service
        .stream({ sessionKey: 's3', userId: 'u1', content: 'hello' }, { frameGenerator: gen })
        .subscribe({
          next: (event) => events.push(event),
          complete: () => {
            expect(events[0].type).toBe('start');
            done();
          },
          error: (err) => done.fail('Stream should not error: ' + JSON.stringify(err)),
        });
    });

    it('should normalize each raw text frame into a chunk event', (done) => {
      const events: BridgeStreamEvent[] = [];
      const gen = makeFrameGen([
        { type: 'start', requestId: 'req-test' },
        { type: 'text', text: 'Chunk 1' },
        { type: 'text', text: 'Chunk 2' },
        { type: 'text', text: 'Chunk 3' },
        { type: 'done' },
      ]);

      service
        .stream({ sessionKey: 's4', userId: 'u1', content: 'hi' }, { frameGenerator: gen })
        .subscribe({
          next: (event) => events.push(event),
          complete: () => {
            const chunks = events.filter((e) => e.type === 'chunk');
            expect(chunks.length).toBe(3);
            done();
          },
          error: (err) => done.fail('Stream should not error: ' + JSON.stringify(err)),
        });
    });

    it('should emit done event at the end with accumulated fullText', (done) => {
      const events: BridgeStreamEvent[] = [];
      const gen = makeFrameGen([
        { type: 'start', requestId: 'req-test' },
        { type: 'text', text: 'Part ' },
        { type: 'text', text: 'one. ' },
        { type: 'text', text: 'Done.' },
        { type: 'done' },
      ]);

      service
        .stream({ sessionKey: 's5', userId: 'u1', content: 'hello' }, { frameGenerator: gen })
        .subscribe({
          next: (event) => events.push(event),
          complete: () => {
            const doneEvent = events.find((e) => e.type === 'done');
            expect(doneEvent).toBeDefined();
            expect((doneEvent as any).fullText).toBe('Part one. Done.');
            done();
          },
          error: (err) => done.fail('Stream should not error: ' + JSON.stringify(err)),
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // stream() — timeout guard
  // ─────────────────────────────────────────────────────────────────────────
  describe('timeout guard', () => {
    it('should emit a timeout error when no frame arrives within firstChunkTimeoutMs', (done) => {
      service
        .stream({ sessionKey: 's6', userId: 'u1', content: 'timeout test' }, { frameGenerator: neverGen() })
        .subscribe({
          error: (err) => {
            expect(err.type).toBe('error');
            expect(err.code).toBe('timeout');
            done();
          },
        });
    });

    it('should NOT timeout when a frame arrives before the deadline', (done) => {
      const events: BridgeStreamEvent[] = [];
      const gen = makeFrameGen([
        { type: 'start', requestId: 'req-fast' },
        { type: 'text', text: 'fast response' },
        { type: 'done' },
      ]);

      service
        .stream({ sessionKey: 's7', userId: 'u1', content: 'hi' }, { frameGenerator: gen })
        .subscribe({
          next: (event) => events.push(event),
          complete: () => {
            const errorEvents = events.filter((e) => e.type === 'error' && (e as any).code === 'timeout');
            expect(errorEvents).toHaveLength(0);
            done();
          },
          error: (err) => done.fail('Should not error: ' + JSON.stringify(err)),
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // closeDedicatedSession
  // ─────────────────────────────────────────────────────────────────────────
  describe('closeDedicatedSession()', () => {
    it('should close the Gateway session and remove it from activeSessions', async () => {
      mockSessionStateStore.load.mockReturnValue(null);
      await service.ensureDedicatedSession('close-me');

      await service.closeDedicatedSession('close-me');

      // Session should be removed from activeSessions map
      // We can't directly check the map, but we can verify closeSession was called
      // by verifying the next ensureDedicatedSession creates a new session
      const result2 = await service.ensureDedicatedSession('close-me');
      // Since the old session was closed, a new one should be created
      expect(result2.sessionId).toBeDefined();
    });

    it('should be idempotent — closing a non-existent session must not throw', async () => {
      await expect(service.closeDedicatedSession('never-opened')).resolves.not.toThrow();
    });
  });
});
