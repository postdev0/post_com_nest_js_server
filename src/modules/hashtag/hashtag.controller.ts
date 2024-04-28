import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { HashtagService } from "./hashtag.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt.auth.guard";
import { RoutesConstants } from "../../constants/routes.constant";
import { errorResponse, successPaginatedResponse, successPaginatedResponseWithoutDB, successResponse } from "../../base/response";

@Controller('hashtags')
export class HashtagController {
    constructor(private readonly hashtagService: HashtagService) { }

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    async getAll(
        @Res() response: Response,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            const { hashtags, total } = await this.hashtagService.getAll(page, pageSize);
            successPaginatedResponse(response, hashtags, total, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Post('tweet')
    @UseGuards(JwtAuthGuard)
    async createHashtagByTweet(
        @Req() request: Request,
        @Res() response: Response,
        @Body() nameDto: any,
        @Query('tweetId') tweetId: string
    ): Promise<void> {
        try {
            let result = await this.hashtagService.createMultipleHashtagsByTweet(nameDto.hashtags, tweetId)
            successResponse(response, result);
        } catch (error: any) {
            console.log(error)
            errorResponse(response, error.message);
        }
    }

    @Get('search-with-tweets')
    @UseGuards(JwtAuthGuard)
    async searchInterestByName(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let result = await this.hashtagService.searchHashtagByNameWithTweets(name, (request.user as any).id);
            successPaginatedResponseWithoutDB(response, result, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchInterestByNameWithTweets(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.hashtagService.searchHashtagByName(name, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('get-tweets-by-hashtag')
    @UseGuards(JwtAuthGuard)
    async getAllTweetsByHashtag(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let result = await this.hashtagService.getAllTweetsByHashtag(name, (request.user as any).id);
            successPaginatedResponseWithoutDB(response, result, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

}