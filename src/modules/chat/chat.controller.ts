import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { SuperpowerBridgeService } from './bridge/superpower-bridge.service';
import { BridgeStreamEvent } from './bridge/superpower-bridge.types';
import { SendMessageDto, CreateSessionDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private bridgeService: SuperpowerBridgeService,
  ) {}

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

  @Post(':sessionId/stream')
  streamChat(
    @Param('sessionId') sessionId: string,
    @CurrentUser() userId: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ): void {
    // 1. Persist user message + assistant placeholder immediately
    this.chatService
      .writeStreamMessages(sessionId, userId, dto.message)
      .then(({ assistantPlaceholder }) => {
        // 2. Set SSE headers
        res.status(HttpStatus.CREATED);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.flushHeaders();

        const destroy$ = new Subject<void>();

        // 3. Call bridge stream
        const stream$ = this.bridgeService.stream({
          sessionKey: sessionId,
          userId,
          content: dto.message,
        });

        // 4. Relay bridge events as SSE to the HTTP response
        stream$.pipe(takeUntil(destroy$)).subscribe({
          next: (event: BridgeStreamEvent) => {
            if (event.type === 'chunk') {
              res.write(`event: chunk\ndata: ${JSON.stringify({ text: event.text })}\n\n`);
            } else if (event.type === 'start') {
              res.write(`event: start\ndata: ${JSON.stringify({ requestId: event.requestId })}\n\n`);
            } else if (event.type === 'done') {
              // Finalize assistant message with accumulated text
              this.chatService
                .finalizeAssistantMessage(assistantPlaceholder.id, userId, event.fullText)
                .catch((err) => console.error('[stream] finalize failed:', err));
              res.write(`event: done\ndata: ${JSON.stringify({ requestId: event.requestId, fullText: event.fullText })}\n\n`);
              res.end();
              destroy$.next();
              destroy$.complete();
            }
          },
          error: (err: unknown) => {
            const bridgeErr = err as { type: 'error'; code: string; message: string };
            console.error('[stream] bridge error:', err);
            res.write(
              `event: error\ndata: ${JSON.stringify({ code: bridgeErr.code, message: bridgeErr.message })}\n\n`,
            );
            res.end();
            destroy$.next();
            destroy$.complete();
          },
          complete: () => {
            // Observable completed — always close the SSE stream.
            // This handles the case where frames complete without a "done" event.
            res.end();
            destroy$.next();
            destroy$.complete();
          },
        });

        // 5. Clean up if client disconnects
        res.on('close', () => {
          this.bridgeService.endStream(sessionId);
          destroy$.next();
          destroy$.complete();
        });

        // 6. Safety fallback: force-close SSE if it hangs for any reason
        const safetyTimeout = setTimeout(() => {
          if (!res.writableEnded) {
            console.warn('[stream] safety timeout — forcing SSE close');
            res.end();
          }
        }, 5000);
      })
      .catch((err) => {
        console.error('[stream] writeStreamMessages failed:', err);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to start stream' });
        } else {
          res.end();
        }
      });
  }
}
