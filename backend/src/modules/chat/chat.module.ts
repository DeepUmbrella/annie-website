import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';
import { SessionStateStore } from './bridge/session-state.store';
import { DatabaseModule } from '../../common/database/database.module';

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
  ],
})
export class ChatModule {}
