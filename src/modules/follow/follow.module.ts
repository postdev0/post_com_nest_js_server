import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';
import { FollowController } from './follow.controller';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
    NotificationModule,
    BlockModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
