process.env.DATABASE_URL =
  'postgresql://annie:annie_secure_pass@192.168.1.16:5432/annie_db?schema=public';
process.env.OPENCLAW_GATEWAY_TOKEN = 'test-gateway-token';

import { Test } from '@nestjs/testing';
import { INestApplication, CanActivate } from '@nestjs/common';
import { ChatModule } from './chat.module';
import { AppConfigModule } from '../../config/config.module';
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';
import { GATEWAY_CLIENT } from './bridge/superpower-bridge.gateway-client';
import { BridgeStreamEvent } from './bridge/superpower-bridge.types';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('ChatModule gateway bridge wiring', () => {
  let app: INestApplication;

  const allowGuard: CanActivate = {
    canActivate: () => true,
  };

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('initializes the bridge and uses the injected gateway client for real streams', async () => {
    const events: BridgeStreamEvent[] = [];
    const sendMessageStream = jest.fn(
      () =>
        new Observable((observer) => {
          observer.next({ type: 'start', requestId: 'req-module' });
          observer.next({ type: 'text', text: '你好' });
          observer.next({ type: 'done' });
          observer.complete();
        }),
    );
    const gatewayClient = {
      openSession: jest.fn().mockResolvedValue({
        sessionId: 'session-module-1',
        sendMessageStream,
      }),
      closeSession: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, ChatModule],
    })
      .overrideProvider(GATEWAY_CLIENT)
      .useValue(gatewayClient)
      .overrideGuard(JwtAuthGuard)
      .useValue(allowGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const service = app.get(SuperpowerBridgeService);

    await new Promise<void>((resolve, reject) => {
      service.stream({ sessionKey: 'module-session', userId: 'u1', content: 'hello' }).subscribe({
        next: (event) => events.push(event),
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });

    expect(gatewayClient.openSession).toHaveBeenCalledTimes(1);
    expect(sendMessageStream).toHaveBeenCalledWith('hello');
    expect(events.map((event) => event.type)).toEqual(['start', 'chunk', 'done']);
  });
});
