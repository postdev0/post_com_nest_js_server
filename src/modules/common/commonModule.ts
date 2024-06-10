import { Module } from '@nestjs/common';
import { CommonService } from './commonService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '../like/entities/like.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Retweet } from '../retweet/entities/retweet.entity';
import { Bookmark } from '../bookmark/entities/bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Like, Retweet, Bookmark])],
  controllers: [],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
