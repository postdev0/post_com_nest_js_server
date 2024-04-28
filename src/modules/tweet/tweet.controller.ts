import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { Request, Response } from "express";
import { RoutesConstants } from "src/constants/routes.constant";
import { TweetService } from "./tweet.service";
import { JwtAuthGuard } from "../auth/jwt.auth.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { errorResponse, successPaginatedResponse, successPaginatedResponseWithoutDB, successResponse, successResponseForHome } from "../../base/response";

@Controller(RoutesConstants.TWEET)
export class TweetController {
    constructor(
        private readonly tweetsService: TweetService,
    ) { }

    @Post(RoutesConstants.ADD_TWEET)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('media', 10))
    async create(
        @Body() dto: any,
        @Req() request: Request,
        @Res() response: Response,
        @UploadedFiles() media: Express.Multer.File[]
    ): Promise<void> {
        try {
            let result = await this.tweetsService.create(dto, request.user, media);
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get(RoutesConstants.GET_ALL_TWEET)
    @UseGuards(JwtAuthGuard)
    async getAll(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.tweetsService.getAll((request as any).user?.id, page, pageSize)
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get(RoutesConstants.GET_TWEET)
    @UseGuards(JwtAuthGuard)
    async getById(
        @Param(RoutesConstants.ID) id: string,
        @Req() request: Request,
        @Res() response: Response
    ): Promise<void> {
        try {
            let result = await this.tweetsService.getById(id, (request as any).user?.id);
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Put(RoutesConstants.UPDATE_TWEET)
    @UseGuards(JwtAuthGuard)
    async updateById(
        @Param(RoutesConstants.ID) id: string,
        @Req() request: Request,
        @Res() response: Response,
        @Body() updateTweetDto: any,
        @UploadedFiles() media: Express.Multer.File[]
    ): Promise<void> {
        try {
            let result = await this.tweetsService.updateById(id, updateTweetDto, media)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Put(RoutesConstants.UPDATE_TWEET_ACTION)
    @UseGuards(JwtAuthGuard)
    async updateActionById(
        @Param(RoutesConstants.ID) id: string,
        @Param(RoutesConstants.ACTION) action: string,
        @Req() request: Request,
        @Res() response: Response
    ): Promise<void> {
        try {
            let result = await this.tweetsService.updateActionById(id, action);
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('get-tweets-by-interests')
    @UseGuards(JwtAuthGuard)
    async getTweetsByUserInterests(
        @Res() response: Response,
        @Req() request: Request,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let result = await this.tweetsService.getTweetsByUserInterests((request.user as any).id);
            successPaginatedResponseWithoutDB(response, result, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('get-tweets-for-home')
    @UseGuards(JwtAuthGuard)
    async getTweetsForHome(
        @Res() response: Response,
        @Req() request: Request,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            page = Number(page);
            pageSize = Number(pageSize);
            let result = await this.tweetsService.getTweetsByUserInterests((request.user as any).id);
            let totalCount = result.length;
            let isDb = false;
            if (page * pageSize >= totalCount) {
                let { result: newResult, count } = await this.tweetsService.getAll((request as any).user?.id, page, pageSize)
                if ((page - 1) * pageSize < totalCount) {
                    result = [...result, ...newResult]
                } else {
                    totalCount = count;
                    result = newResult
                    isDb = true;
                }
            }
            successResponseForHome(response, result, totalCount, page, pageSize, isDb);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('get-tweets-for-home-by-followers')
    @UseGuards(JwtAuthGuard)
    async getTweetsForHomeByFollowers(
        @Res() response: Response,
        @Req() request: Request,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.tweetsService.getTweetsOfFollowers((request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize)
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }
}