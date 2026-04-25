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
