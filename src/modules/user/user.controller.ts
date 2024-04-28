import { Body, Controller, Get, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { errorResponse, successPaginatedResponse, successResponse } from 'src/base/response';
import { Request, Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RoutesConstants } from 'src/constants/routes.constant';
import { ChangePasswordDto, PasswordDto, UsernameDto } from './dto/update.dto';

@Controller(RoutesConstants.USER)
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) { }

    // @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_ALL_USER)
    async getAll(
        @Res() response: Response,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getAll(page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_USER_DETAILS)
    async getById(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID
        ) id: string): Promise<void> {
        try {
            let result = await this.userService.getById(id || (request.user as any).id)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(RoutesConstants.UPDATE_USER_DETAILS)
    async updateById(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID) id: string,
        @Body() updateUserDto: any
    ): Promise<void> {
        try {
            let result = await this.userService.updateById(id || (request.user as any).id, updateUserDto)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put(RoutesConstants.UPDATE_USER_ACTION)
    async updateActionById(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.ACTION

        ) action: string): Promise<void> {
        try {
            let result = await this.userService.updateActionById(id || (request.user as any).id, action)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post(RoutesConstants.SET_PASSWORD)
    async setPassword(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID) id: string,
        @Body() passwordDto: PasswordDto
    ): Promise<void> {
        try {
            let result = await this.userService.setPassword(id || (request.user as any).id, passwordDto)
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post(RoutesConstants.CHECK_USERNAME)
    async checkUsername(
        @Res() response: Response,
        @Body() usernameDto: UsernameDto
    ): Promise<void> {
        try {
            let result = await this.userService.checkUsername(usernameDto);
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post(RoutesConstants.CHANGE_PASSWORD)
    async changePassword(
        @Req() request: Request,
        @Res() response: Response,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<void> {
        try {
            let result = await this.userService.changePassword((request.user as any).id, changePasswordDto);
            successResponse(response, result);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_USER_TWEETS)
    async getUserTweets(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getUserTweets(id || (request.user as any).id, (request.user as any).id, page, pageSize)
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_USER_LIKED_TWEETS)
    async getAllTweetsLikedByUser(
        @Req() request: Request,
        @Res() response: Response,
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getAllTweetsLikedByUser(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_USER_RETWEETED_TWEETS)
    async getAllTweetsRetweetedByUser(
        @Req() request: Request, 
        @Res() response: Response, 
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getAllTweetsRetweetedByUser(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(RoutesConstants.GET_USER_BOOKMARKED_TWEETS)
    async getAllTweetsBookmarkedByUser(
        @Req() request: Request, 
        @Res() response: Response, 
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getAllTweetsBookmarkedByUser(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }


    @Get(RoutesConstants.GET_USER_COMMENTED_TWEETS)
    @UseGuards(JwtAuthGuard)
    async findByUser(
        @Req() request: Request, 
        @Res() response: Response, 
        @Query(RoutesConstants.ID) id: string,
        @Query(RoutesConstants.PAGE) page: number = 1,
        @Query(RoutesConstants.PAGESIZE) pageSize: number = 10
    ): Promise<void> {
        try {
            let { result, count } = await this.userService.getAllCommentsByUser(id || (request.user as any).id, (request.user as any).id, page, pageSize);
            successPaginatedResponse(response, result, count, page, pageSize);
        } catch (error: any) {
            errorResponse(response, error.message);
        }
    }

}
