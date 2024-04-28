import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import { FeedService } from "./feed.service";
import { Request, Response } from "express";
import { errorResponse, successPaginatedResponse, successResponse } from "src/base/response";
import { JwtAuthGuard } from "../auth/jwt.auth.guard";
import { RoutesConstants } from "src/constants/routes.constant";

@Controller('feed')
export class FeedController {
    constructor(
        private readonly feedService: FeedService
    ) { }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchUsers(
        @Req() request: Request,
        @Res() response: Response,
        @Query('query') query: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.feedService.searchUsers(query, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search-by-username')
    @UseGuards(JwtAuthGuard)
    async searchUsersByUsername(
        @Req() request: Request,
        @Res() response: Response,
        @Query('username') username: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.feedService.searchUsersByUsername(username, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }
}