import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { typeOrmAsyncConfig } from './config/typeorm-config';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
import { TweetModule } from './modules/tweet/tweet.module';
import { LikeModule } from './modules/like/like.module';
import { RetweetModule } from './modules/retweet/retweet.module';
import { S3Module } from './modules/s3/s3.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { FollowModule } from './modules/follow/follow.module';
import { FeedModule } from './modules/feed/feed.module';
import { CommentModule } from './modules/comment/comment.module';
import { InterestModule } from './modules/interest/interest.module';
import { HashtagModule } from './modules/hashtag/hashtag.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    S3Module,
    UserModule,
    AuthModule,
    MailModule,
    TweetModule,
    LikeModule,
    RetweetModule,
    BookmarkModule,
    FollowModule,
    FeedModule,
    CommentModule,
    InterestModule,
    HashtagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
