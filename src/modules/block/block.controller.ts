import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { User } from '../user/entities/user.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { errorResponse, successResponse } from '../../base/response';

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
