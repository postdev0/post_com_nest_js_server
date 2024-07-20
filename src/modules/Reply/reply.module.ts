import { Module } from '@nestjs/common';
import { Reply } from './entities/reply.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { Comment } from '../comment/entities/comment.entity';
import { User } from '../user/entities/user.entity';
import { CommentModule } from '../comment/comment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reply, Comment, User]),
    CommentModule,
    NotificationModule,
  ],
  controllers: [ReplyController],
  providers: [ReplyService],
  exports: [ReplyService],
})
export class ReplyModule {}
