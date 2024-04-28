import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './entities/interest.entity';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';
import { User } from '../user/entities/user.entity';
import { Tweet } from '../tweet/entities/tweet.entity';
import { LikeModule } from '../like/like.module';
import { RetweetModule } from '../retweet/retweet.module';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { CommentModule } from '../comment/comment.module';
import { FollowModule } from '../follow/follow.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Interest, User, Tweet]),
        LikeModule,
        RetweetModule,
        BookmarkModule,
        CommentModule,
        FollowModule,
    ],
    controllers: [InterestController],
    providers: [InterestService],
    exports: [InterestService],
})
export class InterestModule { }
