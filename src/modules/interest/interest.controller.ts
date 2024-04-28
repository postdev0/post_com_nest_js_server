import { Request, Response } from 'express';
import { Controller, Post, Body, Get, Req, Res, UseGuards, Query, Delete } from '@nestjs/common';
import { InterestService } from './interest.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RoutesConstants } from '../../constants/routes.constant';
import { errorResponse, successPaginatedResponse, successPaginatedResponseWithoutDB, successResponse } from '../../base/response';

@Controller('interests')
export class InterestController {
    constructor(private readonly interestService: InterestService) { }

    @Get('get-all')
    @UseGuards(JwtAuthGuard)
    async getAll(
        @Res() response: Response,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            const { interests, total } = await this.interestService.getAll(page, pageSize);
            successPaginatedResponse(response, interests, total, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-by-name')
    async getById(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string
    ): Promise<void> {
        try {
            let result = await this.interestService.getByName(name)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Post('user')
    @UseGuards(JwtAuthGuard)
    async createInterestByUser(
        @Req() request: Request,
        @Res() response: Response,
        @Body() nameDto: any
    ): Promise<void> {
        try {
            let result = await this.interestService.createMultipleInterestsByUser(nameDto.interests, request.user)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Post('tweet')
    @UseGuards(JwtAuthGuard)
    async createInterestByTweet(
        @Req() request: Request,
        @Res() response: Response,
        @Body() nameDto: any,
        @Query('tweetId') tweetId: string
    ): Promise<void> {
        try {
            let result = await this.interestService.createMultipleInterestsByTweet(nameDto.interests, tweetId)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search-with-details')
    @UseGuards(JwtAuthGuard)
    async searchInterestByName(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.interestService.searchInterestByName(name, (request.user as any).id, page, pageSize)
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search-with-users')
    @UseGuards(JwtAuthGuard)
    async searchInterestByNameWithUsers(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string
    ): Promise<void> {
        try {
            let result = await this.interestService.searchInterestByNameWithUsers(name, (request.user as any).id)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search-with-tweets')
    @UseGuards(JwtAuthGuard)
    async searchInterestByNameWithTweets(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let result = await this.interestService.searchInterestByNameWithTweets(name, (request.user as any).id);
            successPaginatedResponseWithoutDB(response, result, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchInterestByNameOnlyInterest(
        @Req() request: Request,
        @Res() response: Response,
        @Query('name') name: string
    ): Promise<void> {
        try {
            let result = await this.interestService.searchInterestByNameOnlyInterest(name)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @Delete('user')
    @UseGuards(JwtAuthGuard)
    async deleteMultipleInterestsByUser(
        @Req() request: Request,
        @Res() response: Response,
        @Body() nameDto: any
    ): Promise<void> {
        try {
            let result = await this.interestService.deleteMultipleInterestsByUser(nameDto.interests, request.user)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }
}
