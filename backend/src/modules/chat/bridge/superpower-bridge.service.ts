import { Injectable, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { Observable, Subject, Subscription, timer, NEVER } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  BridgeStreamEvent,
  SuperpowerGatewayConfig,
} from './superpower-bridge.types';

export interface StreamRequest {
  sessionKey: string;
  userId: string;
  content: string;
}

/**
 * Options for the stream() method — allows injecting a test frame generator.
 */
export interface StreamOptions {
  /**
   * Overrides the default (real) frame generator.
   * Used in tests to simulate Gateway frames without a live connection.
   */
  frameGenerator?: () => Observable<RawFrame>;
}

/**
 * Raw frame types as received from the (mock or real) Gateway.
 */
export type RawFrame =
  | { type: 'start'; requestId: string }
  | { type: 'text'; text: string }
  | { type: 'done' }
  | { type: 'error'; code: string; message: string };

/**
 * Token for injecting the session-state store.
 */
export const SESSION_STATE_STORE = 'SESSION_STATE_STORE';

/**
 * SuperpowerBridgeService bridges the NestJS chat layer to the Superpower
 * Gateway (WebSocket).  It:
 *
 * - Guards against concurrent streams on the same sessionKey (`session_busy`).
 * - Normalises raw Gateway frames into `start / chunk / done` stream events.
 * - Times out if the first frame is not received within `firstChunkTimeoutMs`.
 *
 * This is the **Task 3 skeleton** — it does NOT connect to a live Gateway
 * (that is Task 5).  The `frameGenerator` option lets tests inject mock frames.
 */
@Injectable()
export class SuperpowerBridgeService implements OnModuleDestroy {
  private readonly logger = new Logger(SuperpowerBridgeService.name);

  private config: SuperpowerGatewayConfig | null = null;

  /**
   * Set of sessionKeys that currently have an active (non-terminated) stream.
   */
  private readonly busySessions = new Set<string>();

  /**
   * Subject used to signal "complete" to all active takeUntil pipelines on destroy.
   */
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(SESSION_STATE_STORE)
    private readonly sessionStateStore?: { load(): unknown; save(s: unknown): void },
  ) {}

  /**
   * Must be called once after construction, before any call to `stream()`.
   */
  initialize(config: SuperpowerGatewayConfig): void {
    this.config = config;
    this.logger.log(`Initialized for gateway ${config.url}, agent=${config.targetAgent}`);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Opens (or resumes) a dedicated session and streams the response from the
   * Superpower Gateway, normalised to {@link BridgeStreamEvent}.
   *
   * Emits an error event with code `session_busy` if a stream is already
   * active for the given `sessionKey`.
   */
  stream(request: StreamRequest, options?: StreamOptions): Observable<BridgeStreamEvent> {
    if (!this.config) {
      throw new Error('SuperpowerBridgeService not initialised — call initialize() first');
    }

    const { sessionKey } = request;

    // ── Busy guard ──────────────────────────────────────────────────────────
    if (this.busySessions.has(sessionKey)) {
      return this._busyError(sessionKey);
    }

    this.busySessions.add(sessionKey);
    const requestId = this._newRequestId();
    const sessionKeyCaptured = sessionKey;
    const config = this.config;
    // Default: an Observable that never emits nor completes.
    // In production (Task 5) a real Gateway client will be injected via options.
    // This ensures the busy slot stays held until the subscriber unsubscribes.
    const rawFrames$ = options?.frameGenerator?.() ?? NEVER;

    // A Subject that emits exactly one 'complete' when the stream ends so the
    // takeUntil chain can clean up the busy slot at the right moment.
    const endOfStream$ = new Subject<void>();

    return new Observable<BridgeStreamEvent>((observer) => {
      let accumulatedText = '';
      let completed = false;
      let timeoutTimerSub: Subscription | null = null;

      const cleanup = () => {
        if (completed) return;
        completed = true;
        timeoutTimerSub?.unsubscribe();
        this._releaseSession(sessionKeyCaptured);
        endOfStream$.next();
        endOfStream$.complete();
      };

      // ── Timeout guard ─────────────────────────────────────────────────────
      timeoutTimerSub = timer(config.firstChunkTimeoutMs)
        .pipe(takeUntil(endOfStream$), takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (completed) return;
            const evt: BridgeStreamEvent = {
              type: 'error',
              requestId,
              code: 'timeout',
              message: `No response from gateway within ${config.firstChunkTimeoutMs}ms`,
            };
            observer.next(evt);
            observer.error(evt);
            cleanup();
          },
        });

      // ── Frame processing pipeline ────────────────────────────────────────
      const sub = rawFrames$
        .pipe(takeUntil(endOfStream$), takeUntil(this.destroy$))
        .subscribe({
          next: (frame) => {
            if (completed) return;
            switch (frame.type) {
              case 'start':
                timeoutTimerSub?.unsubscribe();
                observer.next({ type: 'start', requestId });
                break;
              case 'text':
                timeoutTimerSub?.unsubscribe();
                accumulatedText += frame.text;
                observer.next({ type: 'chunk', requestId, text: frame.text });
                break;
              case 'done':
                cleanup();
                observer.next({ type: 'done', requestId, fullText: accumulatedText });
                observer.complete();
                break;
              case 'error':
                cleanup();
                const evt: BridgeStreamEvent = {
                  type: 'error',
                  requestId,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: (frame.code ?? 'upstream_error') as any,
                  message: frame.message,
                };
                observer.next(evt);
                observer.error(evt);
                break;
              default: {
                cleanup();
                const evt: BridgeStreamEvent = {
                  type: 'error',
                  requestId,
                  code: 'upstream_error',
                  message: `Unknown raw frame: ${JSON.stringify(frame)}`,
                };
                observer.next(evt);
                observer.error(evt);
              }
            }
          },
          error: (err) => {
            if (completed) return;
            cleanup();
            const evt: BridgeStreamEvent = {
              type: 'error',
              requestId,
              code: 'upstream_error',
              message: err?.message ?? String(err),
            };
            observer.next(evt);
            observer.error(evt);
          },
        });

      return () => {
        sub.unsubscribe();
        cleanup();
      };
    });
  }

  /**
   * Manually releases a session so its slot is no longer considered busy.
   * Used by the controller when an SSE client disconnects.
   */
  endStream(sessionKey: string): void {
    this._releaseSession(sessionKey);
  }

  onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.busySessions.clear();
    this.logger.log('All streams released on module destroy');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns an Observable that emits exactly one session_busy error and completes.
   * Uses a Subject so the subscriber's next/error handlers are registered before
   * the emission fires (avoids synchronous delivery races).
   */
  private _busyError(sessionKey: string): Observable<BridgeStreamEvent> {
    return new Observable<BridgeStreamEvent>((observer) => {
      const requestId = this._newRequestId();
      // Use setImmediate so the emission is truly deferred past the subscriber
      // registration — pure synchronous of() races with handler registration.
      const id = setImmediate(() => {
        clearImmediate(id);
        const evt: BridgeStreamEvent = {
          type: 'error',
          requestId,
          code: 'session_busy',
          message: `Session "${sessionKey}" already has an active stream`,
        };
        observer.next(evt);
        observer.complete();
      });
      return () => clearImmediate(id);
    });
  }

  private _newRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private _releaseSession(sessionKey: string): void {
    this.busySessions.delete(sessionKey);
  }
}
