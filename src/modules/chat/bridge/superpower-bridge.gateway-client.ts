import { Observable } from 'rxjs';
import { SuperpowerGatewayConfig } from './superpower-bridge.types';
import { RawFrame } from './superpower-bridge.service';

/**
 * Result of opening a dedicated Gateway session.
 * @property sessionId  — the opaque session ID assigned by the Gateway
 * @property sendMessageStream — sends a message and returns a stream of raw frames
 */
export interface SessionResult {
  sessionId: string;
  sendMessageStream(message: string): Observable<RawFrame>;
}

/**
 * Pluggable client for the Superpower Gateway WebSocket protocol.
 *
 * Implementations can be:
 * - **MockGatewayClient**  (used in tests) — emits canned frames synchronously
 * - **RealGatewayClient**  (Task 6 / production) — connects to `config.url`
 *
 * This interface keeps the BridgeService decoupled from the transport so
 * the core session-lifecycle logic can be unit-tested without a live server.
 */
export interface GatewayClient {
  /**
   * Opens a named, dedicated session on the Gateway.
   * The returned `sessionId` is persisted by the caller so the session can be
   * resumed after a restart.
   *
   * @param config      — full gateway configuration (url, token, targetAgent …)
   * @param sessionLabel — human-readable label for this session (used as `sessionKey`)
   */
  openSession(config: SuperpowerGatewayConfig, sessionLabel: string): Promise<SessionResult>;

  /**
   * Closes a previously opened session.
   * Idempotent — closing a non-existent session must not throw.
   */
  closeSession(sessionId: string): Promise<void>;
}

/**
 * Factory token for injecting the {@link GatewayClient} implementation.
 * Registered in the NestJS DI container via `chat.module.ts`.
 */
export const GATEWAY_CLIENT = 'GATEWAY_CLIENT';
