import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(sessionId: string, userId: string, content: string) {
    // TODO: Implement Annie AI integration
    const message = await this.prisma.message.create({
      data: {
        sessionId,
        role: 'USER',
        content,
      },
    });

    // Simulate Annie response
    const assistantMessage = await this.prisma.message.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: '这是 Annie 的回复（待集成真实 AI 服务）',
      },
    });

    return {
      userMessage: message,
      assistantMessage: assistantMessage,
    };
  }

  async getSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createSession(userId: string, title: string) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Chat',
      },
    });
  }

  async deleteSession(sessionId: string, userId: string) {
    // Verify ownership
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new Error('无权删除此会话');
    }

    return this.prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }
}
