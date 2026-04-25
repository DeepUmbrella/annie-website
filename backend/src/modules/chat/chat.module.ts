import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';
import { SessionStateStore } from './bridge/session-state.store';
import { GATEWAY_CLIENT } from './bridge/superpower-bridge.gateway-client';
import { DatabaseModule } from '../../common/database/database.module';
import { SuperpowerGatewayConfig } from './bridge/superpower-bridge.types';

/**
 * Minimal in-memory GatewayClient that throws on any real operation.
 * In production (Task 6) this will be replaced by a real WebSocket implementation
 * that is injected here.  Tests inject their own mock via the test module's
 * `GATEWAY_CLIENT` provider override.
 */
class NoOpGatewayClient {
  async openSession(_config: SuperpowerGatewayConfig, _sessionLabel: string) {
    throw new Error(
      'NoOpGatewayClient — a real GatewayClient implementation must be registered in chat.module.ts',
    );
  }
  async closeSession(_sessionId: string) {}
}

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    SuperpowerBridgeService,
    {
      provide: 'SESSION_STATE_STORE',
      useValue: new SessionStateStore('/tmp/superpower-session-state.json'),
    },
    {
      provide: GATEWAY_CLIENT,
      useClass: NoOpGatewayClient,
    },
  ],
})
export class ChatModule {}

export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  meilisearch: {
    url: process.env.MEILISEARCH_URL || 'http://localhost:7700',
    masterKey: process.env.MEILISEARCH_MASTER_KEY,
  },
  cors: {
    origin:
      process.env.CORS_ORIGIN ||
      'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173',
  },
  annie: {
    apiUrl: process.env.ANNIE_API_URL,
    apiKey: process.env.ANNIE_API_KEY,
  },
  gateway: {
    url: process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789/ws',
    token: process.env.OPENCLAW_GATEWAY_TOKEN,
  },
  superpowerChat: {
    targetAgent: process.env.OPENCLAW_SUPERPOWER_AGENT || 'superpower',
    sessionLabel: process.env.OPENCLAW_SUPERPOWER_SESSION_LABEL || 'annie-chat-runtime',
    stateFilePath: process.env.OPENCLAW_SUPERPOWER_STATE_FILE || '.runtime/superpower-chat-session.json',
    firstChunkTimeoutMs: parseInt(process.env.OPENCLAW_SUPERPOWER_FIRST_CHUNK_TIMEOUT_MS ?? '15000', 10),
    idleTimeoutMs: parseInt(process.env.OPENCLAW_SUPERPOWER_IDLE_TIMEOUT_MS ?? '45000', 10),
  },
});
