import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { Request, Response } from 'express';
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from '../../base/response';
import { RoutesConstants } from '../../constants/routes.constant';

@Controller('likes')
export class LikeController {
  tweetsService: any;
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: any,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    try {
      let result = await this.likeService.addRemoveLike(
        dto,
        (request as any).user,
      );
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get(':tweetId')
  @UseGuards(JwtAuthGuard)
  async get(
    @Param('tweetId') tweetId: any,
    @Req() request: Request,
    @Res() response: Response,
    @Query(RoutesConstants.PAGE) page: number = 1,
    @Query(RoutesConstants.PAGESIZE) pageSize: number = 10,
  ): Promise<void> {
    try {
      let { result, count } = await this.likeService.getAllLikedUsersOfTweet(
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
}
