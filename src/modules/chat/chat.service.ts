import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async assertSessionOwnership(sessionId: string, userId: string): Promise<void> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });
    if (!session || session.userId !== userId) {
      throw new Error('无权访问此会话');
    }
  }

  async createUserMessage(sessionId: string, userId: string, content: string) {
    await this.assertSessionOwnership(sessionId, userId);
    return this.prisma.message.create({
      data: {
        sessionId,
        role: 'USER',
        content,
      },
    });
  }

  async createAssistantPlaceholder(sessionId: string) {
    return this.prisma.message.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        content: '',
      },
    });
  }

  async finalizeAssistantMessage(messageId: string, userId: string, content: string) {
    // Fetch message with its session to verify ownership
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { session: { select: { userId: true } } },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.role !== 'ASSISTANT') {
      throw new Error('Only assistant messages can be finalized');
    }

    if (message.session.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
  }

  async sendMessage(sessionId: string, userId: string, content: string) {
    const userMsg = await this.createUserMessage(sessionId, userId, content);
    const assistantPlaceholder = await this.createAssistantPlaceholder(sessionId);
    return {
      userMessage: userMsg,
      assistantPlaceholder,
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
