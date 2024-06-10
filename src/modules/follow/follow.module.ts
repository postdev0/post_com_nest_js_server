import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';
import { FollowController } from './follow.controller';
import { User } from '../user/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), NotificationModule],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
