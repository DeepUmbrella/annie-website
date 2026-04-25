import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subject, timer, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { SuperpowerBridgeService } from './superpower-bridge.service';
import { BridgeStreamEvent } from './superpower-bridge.types';
import { RawFrame } from './superpower-bridge.service';

/**
 * Helper: builds a mock frame generator that emits the given frames and completes.
 */
function makeFrameGen(frames: RawFrame[]): () => Observable<RawFrame> {
  return () =>
    new Observable((observer) => {
      frames.forEach((f) => observer.next(f));
      observer.complete();
    });
}

/**
 * Helper: builds a frame generator that never emits anything (simulates dead Gateway).
 */
function neverGen(): () => Observable<RawFrame> {
  return () => new Observable(() => {});
}

// ─── Minimal mock SessionStateStore ─────────────────────────────────────────
const mockSessionStateStore = {
  load: jest.fn().mockReturnValue(null),
  save: jest.fn(),
};

describe('SuperpowerBridgeService', () => {
  let service: SuperpowerBridgeService;

  const mockConfig = {
    url: 'ws://localhost:9000',
    targetAgent: 'annie',
    sessionLabel: 'test-session',
    stateFilePath: '/tmp/test-state.json',
    firstChunkTimeoutMs: 200,   // short so tests don't lag
    idleTimeoutMs: 30000,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperpowerBridgeService,
        { provide: 'SESSION_STATE_STORE', useValue: mockSessionStateStore },
      ],
    }).compile();

    service = module.get<SuperpowerBridgeService>(SuperpowerBridgeService);
    service.initialize(mockConfig);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // busy guard
  // ─────────────────────────────────────────────────────────────────────────
  describe('busy guard', () => {
    it('should emit session_busy error for a concurrent stream on the same sessionKey', (done) => {
      // First stream with default rawFrames$ = NEVER → never emits, never completes
      // → holds the busy slot indefinitely (simulates a long-running stream)
      service
        .stream({ sessionKey: 's1', userId: 'u1', content: 'hello' })
        .subscribe({ error: () => {} });

      // Second stream for same key must be immediately rejected via _busyError.
      // _busyError uses setImmediate so the event fires in the next event-loop tick.
      let receivedError = false;
      service
        .stream({ sessionKey: 's1', userId: 'u1', content: 'concurrent' })
        .subscribe({
          next: (event) => {
            if ((event as any).code === 'session_busy') {
              receivedError = true;
            }
          },
          error: (err) => {
            if ((err as any).code === 'session_busy') receivedError = true;
          },
        });

      // The setImmediate fires asynchronously; give it a tick to deliver
      setTimeout(() => {
        expect(receivedError).toBe(true);
        done();
      }, 20);
    });

    it('should allow a new stream after the previous stream completes', (done) => {
      const events: BridgeStreamEvent[] = [];

      const gen = makeFrameGen([
        { type: 'start', requestId: 'r1' },
        { type: 'text', text: 'Hello' },
        { type: 'done' },
      ]);

      const sub1 = service
        .stream({ sessionKey: 's2', userId: 'u1', content: 'first' }, { frameGenerator: gen })
        .subscribe({
          next: (e) => events.push(e),
          complete: () => {
            // After complete, session s2 should be free — second stream must not be rejected
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
                  if ((err as any).code === 'session_busy') {
                    done.fail('Second stream should not be rejected as busy');
                  }
                },
              });
          },
          error: () => {},
        });
    });

    it('should keep different sessionKeys independent — no cross-contamination', (done) => {
      const eventsA: BridgeStreamEvent[] = [];
      const eventsB: BridgeStreamEvent[] = [];

      const genA = makeFrameGen([{ type: 'start', requestId: 'rA' }, { type: 'done' }]);
      const genB = makeFrameGen([{ type: 'start', requestId: 'rB' }, { type: 'done' }]);

      service
        .stream({ sessionKey: 'key-A', userId: 'u1', content: 'msg-A' }, { frameGenerator: genA })
        .subscribe({ next: (e) => eventsA.push(e), error: () => {} });

      // key-B must not be affected by key-A being busy
      service
        .stream({ sessionKey: 'key-B', userId: 'u1', content: 'msg-B' }, { frameGenerator: genB })
        .subscribe({
          next: (e) => eventsB.push(e),
          complete: () => {
            const busyOnB = eventsB.filter(
              (ev) => ev.type === 'error' && (ev as any).code === 'session_busy',
            );
            expect(busyOnB).toHaveLength(0);
            done();
          },
          error: () => {},
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // text frame normalization — start / chunk / done
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
            expect((events[0] as any).requestId).toBeDefined();
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
            chunks.forEach((c) => {
              expect((c as any).type).toBe('chunk');
              expect((c as any).text).toBeDefined();
              expect(typeof (c as any).text).toBe('string');
            });
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
            expect((doneEvent as any).requestId).toBeDefined();
            done();
          },
          error: (err) => done.fail('Stream should not error: ' + JSON.stringify(err)),
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // timeout guard
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
  });
});
