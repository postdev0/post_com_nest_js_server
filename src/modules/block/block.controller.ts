import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { User } from '../user/entities/user.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { errorResponse, successPaginatedResponse, successResponse } from '../../base/response';
import { RoutesConstants } from '../../constants/routes.constant';

@Controller('block')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private blockService: BlockService) {}

  @Post(':id')
  async blockUser(
    @Param('id') blockedUserId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const blocker = request.user as User;
      const blocked = await this.blockService.findUserById(blockedUserId);
      let result = await this.blockService.blockUser(blocker, blocked);
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Get()
  async allBlockedUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Query(RoutesConstants.PAGE) page: number = 1,
    @Query(RoutesConstants.PAGESIZE) pageSize: number = 10,
  ) {
    try {
      let { result, count } = await this.blockService.allBlockedUsers(
        request.user as User,
        page,
        pageSize,
      );
      successPaginatedResponse(response, result, count, page, pageSize);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }

  @Delete(':id')
  async unblockUser(
    @Param('id') blockedUserId: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const blocker = request.user as User;
      const blocked = await this.blockService.findUserById(blockedUserId);
      let result = await this.blockService.unblockUser(blocker, blocked);
      successResponse(response, result);
    } catch (error: any) {
      errorResponse(response, error.message);
    }
  }
}
