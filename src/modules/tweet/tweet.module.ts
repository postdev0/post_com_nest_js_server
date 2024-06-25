import { Module } from '@nestjs/common';
import { Tweet } from './entities/tweet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';
import { Like } from '../like/entities/like.entity';
import { Retweet } from '../retweet/entities/retweet.entity';
import { S3Module } from '../s3/s3.module';
import { LikeModule } from '../like/like.module';
import { RetweetModule } from '../retweet/retweet.module';
import { Bookmark } from '../bookmark/entities/bookmark.entity';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { User } from '../user/entities/user.entity';
import { CommentModule } from '../comment/comment.module';
import { Interest } from '../interest/entities/interest.entity';
import { Follow } from '../follow/entities/follow.entity';
import { FollowModule } from '../follow/follow.module';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tweet,
      Like,
      Retweet,
      Bookmark,
      User,
      Interest,
      Follow,
    ]),
    S3Module,
    LikeModule,
    RetweetModule,
    BookmarkModule,
    CommentModule,
    FollowModule,
    BlockModule,
  ],
  controllers: [TweetController],
  providers: [TweetService],
  exports: [TweetService],
})
export class TweetModule {}
