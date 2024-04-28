import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { RetweetService } from "./retweet.service";
import { JwtAuthGuard } from "../auth/jwt.auth.guard";
import { Request, Response } from "express";
import { errorResponse, successPaginatedResponse, successResponse } from "../../base/response";
import { RoutesConstants } from "../../constants/routes.constant";

@Controller('retweets')
export class RetweetController {
    tweetsService: any;
    constructor(
        private readonly retweetService: RetweetService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() dto: any,
        @Req() request: Request,
        @Res() response: Response
    ): Promise<void> {
        try {
            let result = await this.retweetService.addRemoveRetweet(dto, (request as any).user);
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
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.retweetService.getAllRetweetedUsersOfTweet(tweetId, (request.user as any).id);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }
}