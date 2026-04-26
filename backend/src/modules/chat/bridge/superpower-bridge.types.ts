export type BridgeStreamEvent =
  | { type: 'start'; requestId: string }
  | { type: 'chunk'; requestId: string; text: string }
  | { type: 'done'; requestId: string; fullText: string }
  | {
      type: 'error';
      requestId: string;
      code: 'service_unavailable' | 'session_busy' | 'timeout' | 'upstream_error';
      message: string;
    };

/** Schema of the dedicated-session state file persisted at stateFilePath. */
export type DedicatedSessionState = {
  sessionKey: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SuperpowerGatewayConfig = {
  url: string;
  token?: string;
  targetAgent: string;
  sessionLabel: string;
  stateFilePath: string;
  firstChunkTimeoutMs: number;
  idleTimeoutMs: number;
};
