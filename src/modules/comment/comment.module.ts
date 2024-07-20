import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { S3Module } from '../s3/s3.module';
import { Tweet } from '../tweet/entities/tweet.entity';
import { NotificationModule } from '../notification/notification.module';
import { CommonModule } from '../common/commonModule';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Tweet, User]),
    S3Module,
    NotificationModule,
    CommonModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
