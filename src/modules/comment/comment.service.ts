import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { Comment } from './entities/comment.entity';
import { S3Service } from '../s3/s3.service';
import { Tweet } from '../tweet/entities/tweet.entity';
import { CommentsList } from 'src/base/interface';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Tweet) private readonly tweetRepository: Repository<Tweet>,
        private readonly s3Service: S3Service,
    ) { }

    async create(createCommentDto: CreateCommentDto, user: any, tweetId: string, media?: any[]): Promise<Comment> {
        let commentMedia: any[] = [];
        if (media) {
            await Promise.all(media.map(async m => {
                let { fileURL } = await this.s3Service.uploadImageS3(m);
                commentMedia.push(fileURL);
            }));
        }
        let tweet = await this.tweetRepository.findOneBy({ id: tweetId });
        const comment = this.commentRepository.create({ media: commentMedia, ...createCommentDto });
        comment.user = user;
        comment.tweet = tweet;
        tweet.commentsCount++;
        await this.tweetRepository.save(tweet);
        return await this.commentRepository.save(comment);
    }

    async getCommentById(id: string): Promise<Comment> {
        return await this.commentRepository.findOne({
            where: { id },
            relations: ['user', 'tweet'],
        });
    }

    async update(id: string, updateCommentDto: UpdateCommentDto, media?: any[]): Promise<any> {
        const comment = await this.commentRepository.findOne({ where: { id } });
        if (!comment) throw new NotFoundException('Comment not found');
        let commentMedia: any[] = [];
        if (media) {
            await Promise.all(media.map(async m => {
                let { fileURL } = await this.s3Service.uploadImageS3(m);
                commentMedia.push(fileURL);
            }));
            return await this.commentRepository.update(id, { media: commentMedia, isEdited: true, ...updateCommentDto });
        } else {
            return await this.commentRepository.update(id, { isEdited: true, ...updateCommentDto });
        }

    }

    async getAllCommentsOfTweet(tweetId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [comment, count] = await this.commentRepository.findAndCount({
            where: { tweet: { id: tweetId } },
            relations: ['user'],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: CommentsList[] = comment.map((c: any) => {
            return {
                id: c.id,
                text: c.text,
                media: c.media,
                isEdited: c.isEdited,
                userId: c.user.id,
                username: c.user.username,
                fullName: c.user.fullName,
                avatar: c.user.avatar,
                createdAt: c.createdAt,
                modifiedAt: c.modifiedAt,
            }
        })

        return { result, count };

    }

    async isTweetCommentedByUser(tweet: Tweet, userId: string): Promise<boolean> {
        if (!userId) return false
        const foundedComment: Comment | null = await this.commentRepository.findOne({
            where: { user: { id: userId }, tweet: { id: tweet.id } },
        });
        return foundedComment ? true : false;
    }

}
