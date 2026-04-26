import { randomUUID } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { Observable } from 'rxjs';
import { SuperpowerGatewayConfig } from './superpower-bridge.types';
import { RawFrame } from './superpower-bridge.service';

/**
 * Result of opening a dedicated Gateway session.
 * @property sessionId  — the opaque session ID assigned by the Gateway
 * @property sessionKey — the canonical session key used for Gateway RPC calls
 * @property sendMessageStream — sends a message and returns a stream of raw frames
 */
export interface SessionResult {
  sessionId: string;
  sessionKey: string;
  sendMessageStream(message: string): Observable<RawFrame>;
}

/**
 * Pluggable client for the Superpower Gateway WebSocket protocol.
 */
export interface GatewayClient {
  openSession(config: SuperpowerGatewayConfig, sessionLabel: string): Promise<SessionResult>;
  closeSession(sessionId: string): Promise<void>;
}

/**
 * Factory token for injecting the {@link GatewayClient} implementation.
 */
export const GATEWAY_CLIENT = 'GATEWAY_CLIENT';

type GatewayEventListener = (event: string, payload: any) => void;

interface DeviceIdentity {
  deviceId: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function derivePublicKeyRaw(publicKeyPem: string): Buffer {
  const { createPublicKey } = require('crypto');
  const key = createPublicKey(publicKeyPem);
  const spki = key.export({ type: 'spki', format: 'der' }) as Buffer;
  // If Ed25519 SPKI, strip prefix to get raw 32-byte key
  if (
    spki.length === ED25519_SPKI_PREFIX.length + 32 &&
    spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)
  ) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}

/**
 * Build the v2 device auth payload exactly as the Gateway expects.
 * Format: v2|deviceId|clientId|clientMode|role|scopes|signedAtMs|token|nonce
 */
function buildDeviceAuthPayload(params: {
  deviceId: string;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  signedAtMs: number;
  token: string;
  nonce: string;
}): string {
  const scopes = params.scopes.join(',');
  return [
    'v2',
    params.deviceId,
    params.clientId,
    params.clientMode,
    params.role,
    scopes,
    String(params.signedAtMs),
    params.token,
    params.nonce,
  ].join('|');
}

function signDevicePayloadEd25519(privateKeyPem: string, payload: string): string {
  // Ed25519 signing using null algorithm (auto-detects EdDSA/Ed25519 from key type)
  const { createPrivateKey, sign } = require('crypto');
  const key = createPrivateKey(privateKeyPem);
  const signature = sign(null, Buffer.from(payload, 'utf8'), key);
  return base64UrlEncode(Buffer.from(signature));
}

function loadDeviceIdentity(): DeviceIdentity | null {
  const devicePath = path.join(process.env.HOME ?? '', '.openclaw', 'identity', 'device.json');
  if (!existsSync(devicePath)) {
    return null;
  }
  try {
    const raw = readFileSync(devicePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1 && parsed.deviceId && parsed.publicKeyPem && parsed.privateKeyPem) {
      return {
        deviceId: parsed.deviceId,
        publicKeyPem: parsed.publicKeyPem,
        privateKeyPem: parsed.privateKeyPem,
      };
    }
  } catch {
    // fall through
  }
  return null;
}

function extractAssistantText(message: any): string {
  const content = Array.isArray(message?.content) ? message.content : [];
  return content
    .map((part: any) => (part?.type === 'text' && typeof part?.text === 'string' ? part.text : ''))
    .join('');
}

function mapChatEventToRawFrame(payload: any): RawFrame | null {
  const state = payload?.state;
  if (state === 'delta') {
    const text = extractAssistantText(payload?.message);
    if (!text) return null;
    return { type: 'text', text };
  }

  if (state === 'final') {
    return { type: 'done' };
  }

  if (state === 'error') {
    const message =
      typeof payload?.message?.content?.[0]?.text === 'string'
        ? payload.message.content[0].text
        : 'unknown';
    return { type: 'error', code: 'upstream_error', message };
  }

  return null;
}

function mapGatewayErrorCode(errorKind?: string, errorMessage?: string) {
  if (errorKind === 'timeout') {
    return 'timeout';
  }
  if (typeof errorMessage === 'string' && /timeout/i.test(errorMessage)) {
    return 'timeout';
  }
  return 'upstream_error';
}

export class RealGatewayClient implements GatewayClient {
  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private connectedConfigKey: string | null = null;
  private pending = new Map<string, { resolve: (payload: any) => void; reject: (error: Error) => void }>();
  private eventListeners = new Set<GatewayEventListener>();
  private canonicalKeysById = new Map<string, string>();

  async openSession(config: SuperpowerGatewayConfig, sessionLabel: string): Promise<SessionResult> {
    await this.connect(config);

    return new Promise((resolve, reject) => {
      const reqId = `create_${randomUUID()}`;

      const timeout = setTimeout(() => {
        this.pending.delete(reqId);
        reject(new Error(`No response from gateway within 5000ms`));
      }, 5000);

      this.pending.set(reqId, {
        resolve: (payload: any) => {
          clearTimeout(timeout);
          const sessionId = payload?.sessionId;
          const sessionKey = payload?.key;
          console.log('[gateway-client] sessions.create response: sessionId=%s sessionKey=%s', sessionId, sessionKey);
          if (!sessionId || !sessionKey) {
            reject(new Error(`Invalid sessions.create response: ${JSON.stringify(payload)}`));
            return;
          }
          this.canonicalKeysById.set(sessionId, sessionKey);
          resolve({ sessionId, sessionKey, sendMessageStream: (message: string) => this.sendMessageStream(sessionId, sessionKey, message) });
        },
        reject,
      });

      console.log('[gateway-client] sending sessions.create key=%s agentId=%s', sessionLabel, config.targetAgent);
      this.sendFrame({
        type: 'req',
        id: reqId,
        method: 'sessions.create',
        params: { key: sessionLabel, agentId: config.targetAgent, label: sessionLabel },
      });
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.connect(this.ensureConnectedConfig());
    const reqId = `close_${randomUUID()}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(reqId);
        reject(new Error('closeSession timeout'));
      }, 3000);
      this.pending.set(reqId, {
        resolve: () => { clearTimeout(timeout); resolve(); },
        reject: (err) => { clearTimeout(timeout); reject(err); },
      });
      this.sendFrame({ type: 'req', id: reqId, method: 'sessions.delete', params: { key: this.canonicalKeysById.get(sessionId) ?? sessionId } });
    });
  }

  private ensureConnectedConfig(): SuperpowerGatewayConfig {
    throw new Error('Unimplemented');
  }

  private sendMessageStream(sessionId: string, sessionKey: string, message: string): Observable<RawFrame> {
    console.log('[gateway-client] sendMessageStream sessionKey=%s message=%s', sessionKey, message?.substring(0, 50));
    return new Observable<RawFrame>((subscriber) => {
      const reqId = `send_${randomUUID()}`;
      let cleanedUp = false;
      let lastFullText = '';
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        clearTimeout(safetyTimeout);
        this.eventListeners.delete(listener);
      };

      this.pending.set(reqId, {
        resolve: () => undefined,
        reject: (err: Error) => {
          cleanup();
          subscriber.next({ type: 'error', code: mapGatewayErrorCode(undefined, err.message), message: err.message });
          subscriber.complete();
        },
      });

      // Listen for frames from this session
      const listener = (event: string, payload: any) => {
        if (payload?.sessionKey !== sessionKey && payload?.sessionId !== sessionId) return;

        if (event === 'chat') {
          const mapped = mapChatEventToRawFrame(payload);
          if (!mapped) return;
          if (mapped.type === 'done') {
            subscriber.next(mapped);
            cleanup();
            subscriber.complete();
            return;
          }
          if (mapped.type === 'error') {
            subscriber.next(mapped);
            subscriber.next({ type: 'done' });
            cleanup();
            subscriber.complete();
            return;
          }
          if (mapped.type !== 'text') {
            return;
          }
          const fullText = mapped.text;
          const delta = fullText.startsWith(lastFullText) ? fullText.slice(lastFullText.length) : fullText;
          lastFullText = fullText;
          if (delta) {
            subscriber.next({ type: 'text', text: delta });
          }
          return;
        }

        if (event === 'session.abort' || event === 'session.end') {
          subscriber.next({ type: 'done' });
          cleanup();
          subscriber.complete();
        }
      };

      this.eventListeners.add(listener);

      // Send the message
      console.log('[gateway-client] sending sessions.send sessionKey=%s', sessionKey);
      this.sendFrame({
        type: 'req',
        id: reqId,
        method: 'sessions.send',
        params: { key: sessionKey, message },
      });

      // Safety timeout
      const safetyTimeout = setTimeout(() => {
        subscriber.next({ type: 'done' });
        cleanup();
        subscriber.complete();
      }, 15000);
    });
  }

  private async connect(config: SuperpowerGatewayConfig): Promise<void> {
    const configKey = `${config.url}::${config.token ?? ''}`;
    if (this.socket && this.connectedConfigKey === configKey && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (!config.token) {
      throw new Error('OPENCLAW_GATEWAY_TOKEN is required for Gateway auth');
    }

    if (this.connectPromise && this.connectedConfigKey === configKey) {
      return this.connectPromise;
    }

    this.disposeSocket();
    this.connectedConfigKey = configKey;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(config.url);
      this.socket = ws;

      let settled = false;
      const connectRequestId = `connect_${randomUUID()}`;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        this.connectPromise = null;
        this.disposeSocket();
        reject(error);
      };

      const succeed = () => {
        if (settled) return;
        settled = true;
        this.connectPromise = null;
        resolve();
      };

      ws.onopen = () => { console.log('[gateway-client] ws.onopen'); };
      ws.onerror = (err) => {
        console.error('[gateway-client] ws.onerror', err);
        fail(new Error('Failed to connect to OpenClaw Gateway'));
      };
      ws.onclose = (ev) => {
        console.warn('[gateway-client] ws.onclose code=%s reason=%s', ev?.code, ev?.reason);
        const error = new Error('Gateway connection closed');
        for (const pending of [...this.pending.values()]) {
          pending.reject(error);
        }
        this.pending.clear();
        this.socket = null;
        if (!settled) {
          fail(error);
        }
      };
      ws.onmessage = (message) => {
        let frame: any;
        try {
          frame = JSON.parse(String(message.data));
        } catch {
          return;
        }

        if (frame?.type === 'event' && frame?.event === 'connect.challenge') {
          console.log('[gateway-client] recv connect.challenge nonce=%s', frame.payload?.nonce);
          const nonce: string = frame.payload?.nonce;
          const ts: number = frame.payload?.ts ?? Date.now();

          // Load device identity and sign the device auth payload
          const device = loadDeviceIdentity();
          const clientId = 'gateway-client';
          const clientMode = 'backend';
          const role = 'operator';
          const scopes = ['operator.read', 'operator.write'];
          let deviceParams: any = {};
          if (device) {
            const signedAtMs = ts;
            const token = config.token ?? '';
            const payload = buildDeviceAuthPayload({
              deviceId: device.deviceId,
              clientId,
              clientMode,
              role,
              scopes,
              signedAtMs,
              token,
              nonce,
            });
            const signature = signDevicePayloadEd25519(device.privateKeyPem, payload);
            const rawPubKey = derivePublicKeyRaw(device.publicKeyPem);
            const publicKeyBase64Url = base64UrlEncode(rawPubKey);
            deviceParams = {
              id: device.deviceId,
              publicKey: publicKeyBase64Url,
              signature,
              nonce,
              signedAt: signedAtMs,
            };
          }

          this.sendFrame({
            type: 'req',
            id: connectRequestId,
            method: 'connect',
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: 'gateway-client',
                version: '0.0.1',
                platform: 'darwin',
                mode: 'backend',
              },
              role: 'operator',
              scopes: ['operator.read', 'operator.write'],
              caps: [],
              commands: [],
              permissions: {},
              auth: { token: config.token },
              locale: 'zh-CN',
              userAgent: 'annie-website-backend/0.0.1',
              ...(deviceParams.id ? { device: deviceParams } : {}),
            },
          });
          return;
        }

        if (frame?.type === 'res' && frame?.id === connectRequestId) {
          if (frame.ok) {
            console.log('[gateway-client] connect SUCCESS');
            succeed();
          } else {
            console.error('[gateway-client] connect FAILED:', frame?.error);
            fail(new Error(frame?.error?.message ?? 'Gateway connect failed'));
          }
          return;
        }

        if (frame?.type === 'res' && typeof frame?.id === 'string') {
          const pending = this.pending.get(frame.id);
          if (!pending) return;
          this.pending.delete(frame.id);
          if (frame.ok) {
            pending.resolve(frame.payload);
          } else {
            pending.reject(new Error(frame?.error?.message ?? `Gateway RPC failed: ${frame.id}`));
          }
          return;
        }

        if (frame?.type === 'event' && typeof frame?.event === 'string') {
          console.log('[gateway-client] event=%s payloadKeys=%s', frame.event, Object.keys(frame.payload ?? {}).join(','));
          for (const listener of this.eventListeners) {
            listener(frame.event, frame.payload);
          }
        }

        if (frame?.type === 'res' && typeof frame?.id === 'string' && frame.id !== connectRequestId) {
          console.log('[gateway-client] res id=%s ok=%s', frame.id, frame.ok);
        }
      };
    });

    return this.connectPromise;
  }

  private disposeSocket() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  private sendFrame(frame: object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Gateway socket is not connected');
    }
    this.socket.send(JSON.stringify(frame));
  }
}

/** No-op client used before the bridge is initialized. */
export class NoOpGatewayClient implements GatewayClient {
  async openSession(_config: SuperpowerGatewayConfig, _sessionLabel: string): Promise<SessionResult> {
    return {
      sessionId: 'none',
      sessionKey: 'none',
      sendMessageStream: () => new Observable<RawFrame>(obs => { obs.complete(); }),
    };
  }
  async closeSession(_sessionId: string): Promise<void> {}
}
