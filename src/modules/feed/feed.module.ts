import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FollowModule } from '../follow/follow.module';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FollowModule, BlockModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
