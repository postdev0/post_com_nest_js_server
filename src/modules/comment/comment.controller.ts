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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RoutesConstants } from 'src/constants/routes.constant';
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from '../../base/response';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
      let result = await this.commentService.getCommentById(id);
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
        page,
        pageSize,
      );
      successPaginatedResponse(response, result, count, page, pageSize);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }
}
