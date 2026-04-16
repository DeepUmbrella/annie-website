import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(
    userId: string,
    name: string,
    email: string,
    subject: string,
    message: string,
  ) {
    return this.prisma.feedback.create({
      data: {
        userId,
        name,
        email,
        subject,
        message,
      },
    });
  }

  async getFeedback(userId?: string) {
    const where = userId ? { userId } : {};
    
    return this.prisma.feedback.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFeedbackStatus(
    id: string,
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED',
  ) {
    return this.prisma.feedback.update({
      where: { id },
      data: { status },
    });
  }
}
