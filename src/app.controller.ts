import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    @Get()
    async getDeepLinkFile(
        @Res() response: Response,
    ): Promise<void> {
      try {
        let result = await this.appService.getHello();
        response.status(200).json(result)
    } catch (error: any) {
          response.status(500).json(error)
      }
    }

    
}