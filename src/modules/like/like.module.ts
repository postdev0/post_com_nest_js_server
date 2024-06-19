import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Like } from './entities/like.entity';
import { FollowModule } from '../follow/follow.module';
import { NotificationModule } from '../notification/notification.module';
import { CommonModule } from '../common/commonModule';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, Like]),
    FollowModule,
    NotificationModule,
    CommonModule,
    BlockModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
