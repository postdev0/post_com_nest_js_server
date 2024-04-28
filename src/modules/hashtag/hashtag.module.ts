import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Hashtag } from "./entities/hashtag.entity";
import { Tweet } from "../tweet/entities/tweet.entity";
import { HashtagController } from "./hashtag.controller";
import { HashtagService } from "./hashtag.service";
import { LikeModule } from "../like/like.module";
import { RetweetModule } from "../retweet/retweet.module";
import { BookmarkModule } from "../bookmark/bookmark.module";
import { CommentModule } from "../comment/comment.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Hashtag, Tweet]),
        LikeModule,
        RetweetModule,
        BookmarkModule,
        CommentModule,
    ],
    controllers: [HashtagController],
    providers: [HashtagService],
    exports: [HashtagService],
})
export class HashtagModule { }