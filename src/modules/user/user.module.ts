import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Like } from '../like/entities/like.entity';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Retweet } from '../retweet/entities/retweet.entity';
import { LikeModule } from '../like/like.module';
import { RetweetModule } from '../retweet/retweet.module';
import { Bookmark } from '../bookmark/entities/bookmark.entity';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { Comment } from '../comment/entities/comment.entity';
import { CommentModule } from '../comment/comment.module';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tweet, Like, Retweet, Bookmark, Comment]),
    LikeModule,
    RetweetModule,
    BookmarkModule,
    CommentModule,
    FollowModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
