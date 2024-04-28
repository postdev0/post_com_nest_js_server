import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { S3Module } from '../s3/s3.module';
import { Tweet } from '../tweet/entities/tweet.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, Tweet]),
        S3Module
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule { }
