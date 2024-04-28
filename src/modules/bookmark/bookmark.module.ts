import { TypeOrmModule } from "@nestjs/typeorm";
import { Tweet } from "../tweet/entities/tweet.entity";
import { Bookmark } from "./entities/bookmark.entity";
import { Module } from "@nestjs/common";
import { BookmarkController } from "./bookmark.controller";
import { BookmarkService } from "./bookmark.service";
import { FollowModule } from "../follow/follow.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, Bookmark]),
    FollowModule,
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule { }