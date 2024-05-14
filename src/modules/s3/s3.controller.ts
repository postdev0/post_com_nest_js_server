import { Controller, Delete, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { JwtAuthGuard } from "../auth/jwt.auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express, Request, Response } from "express";
import { errorResponse, successResponse } from "src/base/response";

@Controller('file')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
  ) { }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@Req() request: Request, @Res() response: Response, @UploadedFile() file: Express.Multer.File): Promise<void> {
    try {
      successResponse(response, await this.s3Service.uploadImageS3(file, (request.user as any).id));
    } catch (error) {
      errorResponse(response, error.message);
    }
  }

  @Delete('image/:uniqueFilename')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Req() request: Request, @Res() response: Response, @Param('uniqueFilename') uniqueFilename: string): Promise<void> {
    try {
      successResponse(response, await this.s3Service.deleteImageS3(uniqueFilename, (request.user as any).id));
    } catch (error) {
      errorResponse(response, error.message);
    }
  }

  @Post('cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(@Req() request: Request, @Res() response: Response, @UploadedFile() file: Express.Multer.File): Promise<void> {
    try {
      console.log({ file })
      successResponse(response, await this.s3Service.uploadCoverS3(file, (request.user as any).id));

    } catch (error) {
      errorResponse(response, error.message);
    }
  }

  @Delete('cover/:uniqueFilename')
  @UseGuards(JwtAuthGuard)
  async deleteCover(@Req() request: Request, @Res() response: Response, @Param('uniqueFilename') uniqueFilename: string): Promise<void> {
    try {
      successResponse(response, await this.s3Service.deleteCoverS3(uniqueFilename, (request.user as any).id));
    } catch (error) {
      errorResponse(response, error.message);
    }
  }
}