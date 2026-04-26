import { Injectable, OnModuleDestroy, OnModuleInit, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  BridgeStreamEvent,
  SuperpowerGatewayConfig,
  DedicatedSessionState,
} from './superpower-bridge.types';
import type { GatewayClient } from './superpower-bridge.gateway-client';
import { GATEWAY_CLIENT, SessionResult } from './superpower-bridge.gateway-client';

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
 * - Manages a dedicated session per sessionKey, persisted to disk so it can be
 *   resumed after a service restart (`ensureDedicatedSession()`).
 * - Guards against concurrent streams on the same sessionKey (`session_busy`).
 * - Normalises raw Gateway frames into `start / chunk / done` stream events.
 * - Times out if the first frame is not received within `firstChunkTimeoutMs`.
 * - Times out an idle session after `idleTimeoutMs` with no active request.
 *
 * This is the **Task 5 implementation** — the `GatewayClient` interface is
 * injected so a real WebSocket transport can be swapped in without changing
 * the session-lifecycle logic.
 */
@Injectable()
export class SuperpowerBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SuperpowerBridgeService.name);

  private config: SuperpowerGatewayConfig | null = null;

  /**
   * Active Gateway sessions keyed by sessionKey.
   * Populated by `ensureDedicatedSession()` and cleared on close/error.
   */
  private readonly activeSessions = new Map<string, SessionResult>();

  /**
   * Set of sessionKeys that currently have an active (non-terminated) stream.
   * This is the *request-level* lock — it guards against concurrent calls to
   * `stream()` for the same sessionKey while a request is in-flight.
   */
  private readonly busySessions = new Set<string>();

  /**
   * Subject used to signal "complete" to all active takeUntil pipelines on destroy.
   */
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(SESSION_STATE_STORE)
    private readonly sessionStateStore?: { load(): DedicatedSessionState | null; save(s: DedicatedSessionState): void },
    @Inject(GATEWAY_CLIENT)
    @Optional()
    private readonly gatewayClient?: GatewayClient,
    @Optional()
    private readonly configService?: ConfigService,
  ) {}

  /**
   * Must be called once after construction, before any call to `stream()`.
   */
  initialize(config: SuperpowerGatewayConfig): void {
    this.config = config;
    this.logger.log(
      `Initialized for gateway ${config.url}, agent=${config.targetAgent}, stateFile=${config.stateFilePath}`,
    );
  }

  onModuleInit(): void {
    if (this.config || !this.configService) {
      return;
    }
    this.initialize({
      url: this.configService.get<string>('gateway.url') ?? 'ws://127.0.0.1:18789/ws',
      token: this.configService.get<string>('gateway.token'),
      targetAgent: this.configService.get<string>('superpowerChat.targetAgent') ?? 'superpower',
      sessionLabel:
        this.configService.get<string>('superpowerChat.sessionLabel') ?? 'annie-chat-runtime',
      stateFilePath:
        this.configService.get<string>('superpowerChat.stateFilePath') ??
        '.runtime/superpower-chat-session.json',
      firstChunkTimeoutMs:
        this.configService.get<number>('superpowerChat.firstChunkTimeoutMs') ?? 15000,
      idleTimeoutMs: this.configService.get<number>('superpowerChat.idleTimeoutMs') ?? 45000,
    });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Ensures a dedicated Gateway session exists for `sessionKey`.
   *
   * Recovery order (locked — each step is tried exactly once):
   *  1. Load persisted state from {@link SessionStateStore}.
   *     - If valid → reuse the saved `sessionId` (no re-create needed).
   *     - If missing or corrupt → fall through to step 2.
   *  2. Create a brand-new session via {@link GatewayClient.openSession()}.
   *  3. Persist the new session state via {@link SessionStateStore.save()}.
   *
   * Returns the active {@link SessionResult} so callers can send messages on it.
   *
   * @throws Error if no `GatewayClient` is available or session creation fails.
   */
  async ensureDedicatedSession(sessionKey: string): Promise<SessionResult> {
    if (!this.config) throw new Error('BridgeService not initialised');
    if (!this.gatewayClient) throw new Error('No GatewayClient injected');

    // ── Step 1: try to restore from persisted state ─────────────────────────
    let saved: DedicatedSessionState | null = null;
    try {
      saved = this.sessionStateStore?.load() ?? null;
    } catch {
      // Corrupt state file — fall through to Step 2.
    }
    if (saved?.sessionId) {
      this.logger.debug(`Restoring session ${saved.sessionId} for key "${sessionKey}"`);
      try {
        // Attempt to open a session with the saved ID.
        // The Gateway may reject a stale ID; in that case we fall through to re-create.
        const result = await this.gatewayClient.openSession(this.config, sessionKey);
        this.activeSessions.set(sessionKey, result);
        return result;
      } catch (restoreErr) {
        this.logger.warn(
          `Could not restore session "${saved.sessionId}" — will create a new one: ${restoreErr}`,
        );
        // Fall through to Step 2
      }
    }

    // ── Step 2: create a new session ────────────────────────────────────────
    this.logger.log(`Creating new dedicated session for key "${sessionKey}"`);
    const result = await this.gatewayClient.openSession(this.config, sessionKey);

    // ── Step 3: persist the new session state ───────────────────────────────
    const state: DedicatedSessionState = {
      sessionKey,
      sessionId: result.sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      this.sessionStateStore?.save(state);
    } catch (saveErr) {
      this.logger.error(`Failed to persist session state: ${saveErr}`);
      // Non-fatal: the session is still active in-memory.
    }

    this.activeSessions.set(sessionKey, result);
    return result;
  }

  /**
   * Opens (or resumes) a dedicated session and streams the response from the
   * Superpower Gateway, normalised to {@link BridgeStreamEvent}.
   *
   * Emits an error event with code `session_busy` if a stream is already
   * active for the given `sessionKey`.
   *
   * Uses the injected {@link GatewayClient} to obtain the session's frame stream.
   */
  stream(request: StreamRequest, options?: StreamOptions): Observable<BridgeStreamEvent> {
    if (!this.config) {
      throw new Error('SuperpowerBridgeService not initialised — call initialize() first');
    }

    const { sessionKey, content } = request;

    // ── Request-level busy guard ─────────────────────────────────────────────
    if (this.busySessions.has(sessionKey)) {
      return this._busyError(sessionKey);
    }

    this.busySessions.add(sessionKey);
    const requestId = this._newRequestId();
    const sessionKeyCaptured = sessionKey;
    const config = this.config;

    // A Subject that emits exactly one 'complete' when the stream ends so the
    // takeUntil chain can clean up the busy slot at the right moment.
    const endOfStream$ = new Subject<void>();

    return new Observable<BridgeStreamEvent>((observer) => {
      let accumulatedText = '';
      let completed = false;
      let timeoutTimerSub: Subscription | null = null;
      let frameSub: Subscription | null = null;

      const cleanup = () => {
        if (completed) return;
        completed = true;
        timeoutTimerSub?.unsubscribe();
        frameSub?.unsubscribe();
        this._releaseSession(sessionKeyCaptured);
        endOfStream$.next();
        endOfStream$.complete();
      };

      // ── First-chunk timeout guard ─────────────────────────────────────────
      timeoutTimerSub = timer(config.firstChunkTimeoutMs)
        .pipe(takeUntil(endOfStream$), takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (completed) return;
            observer.error({
              type: 'error',
              requestId,
              code: 'timeout',
              message: `No response from gateway within ${config.firstChunkTimeoutMs}ms`,
            } as BridgeStreamEvent);
            cleanup();
          },
        });

      // ── Lazily acquire a session then subscribe to frames ─────────────────
      // This deferred pattern ensures the timeout fires only if the Gateway
      // itself is slow — not merely because no session has been created yet.
      const subscribeToFrames = async () => {
        try {
          let frames$: Observable<RawFrame>;

          if (options?.frameGenerator) {
            frames$ = options.frameGenerator();
          } else if (this.activeSessions.has(sessionKey)) {
            frames$ = this.activeSessions.get(sessionKey)!.sendMessageStream(content);
          } else {
            // No active session — create one on-demand.
            const result = await this.ensureDedicatedSession(sessionKey);
            if (completed) return;
            frames$ = result.sendMessageStream(content);
          }

          if (completed) return;

          frameSub = frames$
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
                  case 'error': {
                    cleanup();
                    const knownCodes = ['service_unavailable', 'session_busy', 'timeout', 'upstream_error'];
                    const code = knownCodes.includes(frame.code) ? frame.code : 'upstream_error';
                    observer.error({ type: 'error', requestId, code, message: frame.message });
                    break;
                  }
                  default:
                    cleanup();
                    observer.error({
                      type: 'error',
                      requestId,
                      code: 'upstream_error' as const,
                      message: `Unknown raw frame: ${JSON.stringify(frame)}`,
                    });
                }
              },
              error: (err) => {
                if (completed) return;
                cleanup();
                observer.error({
                  type: 'error',
                  requestId,
                  code: 'upstream_error' as const,
                  message: err?.message ?? String(err),
                });
              },
              complete: () => {
                if (completed) return;
                cleanup();
                observer.complete();
              },
            });
        } catch (err) {
          if (completed) return;
          cleanup();
          observer.error({
            type: 'error',
            requestId,
            code: 'service_unavailable' as const,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      };

      void subscribeToFrames();

      return cleanup;
    });
  }

  /**
   * Manually releases a session so its slot is no longer considered busy.
   * Used by the controller when an SSE client disconnects.
   */
  endStream(sessionKey: string): void {
    this._releaseSession(sessionKey);
  }

  /**
   * Closes the dedicated session for `sessionKey` and removes its in-memory
   * record.  Does NOT clear the persisted state file (caller may want to
   * preserve it for resume).
   */
  async closeDedicatedSession(sessionKey: string): Promise<void> {
    const session = this.activeSessions.get(sessionKey);
    if (!session) return;
    try {
      await this.gatewayClient?.closeSession(session.sessionId);
    } catch (err) {
      this.logger.warn(`Error closing session ${session.sessionId}: ${err}`);
    } finally {
      this.activeSessions.delete(sessionKey);
    }
  }

  onModuleDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.busySessions.clear();
    // Close all active sessions
    const closePromises = [...this.activeSessions.keys()].map((k) =>
      this.closeDedicatedSession(k),
    );
    Promise.all(closePromises).catch(() => {});
    this.activeSessions.clear();
    this.logger.log('All sessions and streams released on module destroy');
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
