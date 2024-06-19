import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Retweet } from './entities/retweet.entity';
import { RetweetService } from './retweet.service';
import { RetweetController } from './retweet.controller';
import { FollowModule } from '../follow/follow.module';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, Retweet]),
    FollowModule,
    BlockModule,
  ],
  controllers: [RetweetController],
  providers: [RetweetService],
  exports: [RetweetService],
})
export class RetweetModule {}
