import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Put,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RoutesConstants } from '../../constants/routes.constant';
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from '../../base/response';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('media', 10))
  async create(
    @Req() request: Request,
    @Res() response: Response,
    @Body() createCommentDto: CreateCommentDto,
    @Query('tweetId') tweetId: string,
    @UploadedFiles() media: Express.Multer.File[],
  ): Promise<void> {
    try {
      let result = await this.commentService.create(
        createCommentDto,
        request.user,
        tweetId,
        media,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCommentById(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    try {
      let result = await this.commentService.getCommentById(
        id,
        (request as any).user?.id,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Put(':id')
  async update(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @UploadedFiles() media: Express.Multer.File[],
  ): Promise<void> {
    try {
      let result = await this.commentService.update(
        id,
        updateCommentDto,
        media,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get('tweet/:tweetId')
  async findByTweet(
    @Req() request: Request,
    @Res() response: Response,
    @Param('tweetId') tweetId: string,
    @Query(RoutesConstants.PAGE) page: number = 1,
    @Query(RoutesConstants.PAGESIZE) pageSize: number = 10,
  ): Promise<void> {
    try {
      let { result, count } = await this.commentService.getAllCommentsOfTweet(
        tweetId,
        (request.user as any).id,
        page,
        pageSize,
      );
      successPaginatedResponse(response, result, count, page, pageSize);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Post(':commentId/like')
  async likeComment(
    @Req() request: Request,
    @Res() response: Response,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    try {
      let result = await this.commentService.likeComment(
        (request.user as any).id,
        commentId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Post(':commentId/unlike')
  async unlikeComment(
    @Req() request: Request,
    @Res() response: Response,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    try {
      let result = await this.commentService.unlikeComment(
        (request.user as any).id,
        commentId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get(':commentId/isLiked')
  async isCommentLiked(
    @Req() request: Request,
    @Res() response: Response,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ): Promise<void> {
    try {
      let result = this.commentService.isCommentLiked(
        (request.user as any).id,
        commentId,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }
}
