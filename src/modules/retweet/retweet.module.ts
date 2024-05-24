import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Retweet } from './entities/retweet.entity';
import { RetweetService } from './retweet.service';
import { RetweetController } from './retweet.controller';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, Retweet]), FollowModule],
  controllers: [RetweetController],
  providers: [RetweetService],
  exports: [RetweetService],
})
export class RetweetModule {}
