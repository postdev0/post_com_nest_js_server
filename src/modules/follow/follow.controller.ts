import { Controller, Get, Post, Param, Req, Res, Query, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { errorResponse, successPaginatedResponse, successResponse } from '../../base/response';
import { RoutesConstants } from '../../constants/routes.constant';

@Controller('follow')
export class FollowController {
    constructor(
        private readonly followService: FollowService,
    ) { }

    @Post(':id')
    @UseGuards(JwtAuthGuard)
    async followUnfollowUser(
        @Req() request: Request,
        @Res() response: Response,
        @Param('id') id: string
    ): Promise<void> {
        try {
            let result = await this.followService.followUnfollowUser((request.user as any).id, id)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('followers')
    @UseGuards(JwtAuthGuard)
    async getFollowers(
        @Req() request: Request,
        @Res() response: Response,
        @Query('id') id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.followService.getFollowers(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('followings')
    @UseGuards(JwtAuthGuard)
    async getFollowings(
        @Req() request: Request,
        @Res() response: Response,
        @Query('id') id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.followService.getFollowings(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }
}
