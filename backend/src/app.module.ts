import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { BlogModule } from './modules/blog/blog.module';
import { DocsModule } from './modules/docs/docs.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PrismaService } from './common/database/prisma.service';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    BlogModule,
    DocsModule,
    FeedbackModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
