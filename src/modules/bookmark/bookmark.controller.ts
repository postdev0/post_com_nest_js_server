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
import { BookmarkService } from './bookmark.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { Request, Response } from 'express';
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from '../../base/response';
import { RoutesConstants } from '../../constants/routes.constant';

@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() request: Request,
    @Res() response: Response,
    @Body() dto: any,
  ): Promise<void> {
    try {
      let result = await this.bookmarkService.addRemoveBookmark(
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
    @Req() request: Request,
    @Res() response: Response,
    @Param('tweetId') tweetId: any,
    @Query(RoutesConstants.PAGE) page: number = 1,
    @Query(RoutesConstants.PAGESIZE) pageSize: number = 10,
  ): Promise<void> {
    try {
      let { result, count } =
        await this.bookmarkService.getAllbookmarkedUsersOfTweet(
          tweetId,
          (request.user as any).id,
        );
      successPaginatedResponse(response, result, count, page, pageSize);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }
}
