import { Controller, Post, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async submitFeedback(
    @CurrentUser() userId: string,
    @Body() dto: SubmitFeedbackDto,
  ) {
    return this.feedbackService.submitFeedback(
      userId,
      dto.name,
      dto.email,
      dto.subject,
      dto.message,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeedback(@CurrentUser() userId: string) {
    return this.feedbackService.getFeedback(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedbackStatus(id, dto.status);
  }
}
