import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { ReplyService } from './reply.service';
import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../base/response';

@UseGuards(JwtAuthGuard)
@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post(':commentId/reply')
  async replyToComment(
    @Req() request: Request,
    @Res() response: Response,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body('replyText') replyText: string,
  ): Promise<void> {
    try {
      let result = await this.replyService.replyToComment(
        (request.user as any).id,
        commentId,
        replyText,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Post(':replyId/like')
  async likeReply(
    @Req() request: Request,
    @Res() response: Response,
    @Param('replyId', ParseUUIDPipe) replyId: string,
  ): Promise<void> {
    try {
      let result = await this.replyService.likeReply(
        (request.user as any).id,
        replyId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Post(':replyId/unlike')
  async unlikeReply(
    @Req() request: Request,
    @Res() response: Response,
    @Param('replyId', ParseUUIDPipe) replyId: string,
  ): Promise<void> {
    try {
      let result = await this.replyService.unlikeReply(
        (request.user as any).id,
        replyId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get(':replyId/isLiked')
  async isReplyLiked(
    @Req() request: Request,
    @Res() response: Response,
    @Param('replyId', ParseUUIDPipe) replyId: string,
  ): Promise<void> {
    try {
      let result = await this.replyService.isReplyLiked(
        (request.user as any).id,
        replyId,
      );

      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get(':commentId')
  async getAllRepliesOfComment(
    @Req() request: Request,
    @Res() response: Response,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    try {
      let result = await this.replyService.getAllRepliesOfComment(
        (request.user as any).id,
        commentId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }
}
