import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { BlogModule } from './modules/blog/blog.module';
import { DocsModule } from './modules/docs/docs.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    ChatModule,
    BlogModule,
    DocsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
