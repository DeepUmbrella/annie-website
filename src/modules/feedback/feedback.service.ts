import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { FeedbackStatusDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(
    userId: string,
    name: string | undefined,
    email: string | undefined,
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

  async updateFeedbackStatus(id: string, status: FeedbackStatusDto) {
    return this.prisma.feedback.update({
      where: { id },
      data: { status },
    });
  }
}
