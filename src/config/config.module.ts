import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      // Support both running from `backend/` and sharing env files from the repo root.
      envFilePath: ['.env.local', '.env', '../.env.local', '../.env'],
      load: [configuration],
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
