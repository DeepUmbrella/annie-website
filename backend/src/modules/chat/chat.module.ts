import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';
import { SessionStateStore } from './bridge/session-state.store';
import {
  GATEWAY_CLIENT,
  RealGatewayClient,
} from './bridge/superpower-bridge.gateway-client';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
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
      useClass: RealGatewayClient,
    },
  ],
})
export class ChatModule {}
