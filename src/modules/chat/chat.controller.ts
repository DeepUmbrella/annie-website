import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateSessionDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@CurrentUser() userId: string) {
    return this.chatService.getSessions(userId);
  }

  @Post('sessions')
  async createSession(
    @CurrentUser() userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.chatService.createSession(userId, dto.title ?? 'New Chat');
  }

  @Delete('sessions/:sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() userId: string,
  ) {
    return this.chatService.deleteSession(sessionId, userId);
  }

  @Post(':sessionId')
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @CurrentUser() userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(sessionId, userId, dto.message);
  }
}
