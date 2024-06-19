import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { Comment } from './entities/comment.entity';
import { S3Service } from '../s3/s3.service';
import { Tweet } from '../tweet/entities/tweet.entity';
import { CommentsList } from '../../base/interface';
import { NotificationService } from '../notification/notification.service';
import { CommonService } from '../common/commonService';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly s3Service: S3Service,
    private readonly notificationService: NotificationService,
    private readonly commonService: CommonService,
  ) {}

  async sendPushNotification(
    id: string,
    notificationType: string,
    title: string,
    message: string,
    data?: any,
  ) {
    try {
      await this.notificationService.sendPush(
        id,
        notificationType,
        title,
        message,
        data,
      );
    } catch (e) {
      console.log('Error sending push notification', e);
    }
  }

  async create(
    createCommentDto: CreateCommentDto,
    user: any,
    tweetId: string,
    media?: any[],
  ): Promise<Comment> {
    let commentMedia: any[] = [];
    if (media) {
      await Promise.all(
        media.map(async (m) => {
          let { fileURL } = await this.s3Service.uploadImageS3(m);
          commentMedia.push(fileURL);
        }),
      );
    }
    let tweet = await this.tweetRepository.findOne({
      where: { id: tweetId, deleteFlag: false },
      relations: ['user', 'interests', 'hashtags'],
    });

    let { selfLiked, selfRetweeted, selfCommented, selfBookmarked } =
      await this.commonService.likeRetweetCommentBokkmarkProvider(
        tweet,
        tweet.user.id,
      );
    let tweetObject = {
      id: tweet.id,
      text: tweet.text,
      media: tweet.media,
      interests: tweet.interests.map((i) => i.name),
      hashtags: tweet.hashtags.map((i) => i.name),
      commentsCount: tweet.commentsCount,
      retweetsCount: tweet.retweetsCount,
      bookmarksCount: tweet.bookmarksCount,
      likesCount: tweet.likesCount,
      taggedUsers: tweet.taggedUsers,
      isRetweeted: tweet.isRetweeted,
      isEdited: tweet.isEdited,
      isPublic: tweet.isPublic,
      selfLiked,
      selfRetweeted,
      selfCommented,
      selfBookmarked,
      userId: tweet.user.id,
      username: tweet.user.username,
      fullName: tweet.user.fullName,
      avatar: tweet.user.avatar,
      createdAt: tweet.createdAt,
      modifiedAt: tweet.modifiedAt,
    };
    const comment = this.commentRepository.create({
      media: commentMedia,
      ...createCommentDto,
    });
    comment.user = user;
    comment.tweet = tweet;
    tweet.commentsCount++;
    await this.tweetRepository.save(tweet);
    let result = await this.commentRepository.save(comment);
    if (result) {
      let notificationData = {
        notificationType: 'comment',
        data: tweetObject,
      };
      this.sendPushNotification(
        tweet.user.id,
        'comment',
        'Comment update',
        `@${user.username} has commented on your tweet`,
        { notificationData: JSON.stringify(notificationData) },
      );
    }
    return result;
  }

  async getCommentById(id: string): Promise<Comment> {
    return await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'tweet'],
    });
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    media?: any[],
  ): Promise<any> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    let commentMedia: any[] = [];
    if (media) {
      await Promise.all(
        media.map(async (m) => {
          let { fileURL } = await this.s3Service.uploadImageS3(m);
          commentMedia.push(fileURL);
        }),
      );
      return await this.commentRepository.update(id, {
        media: commentMedia,
        isEdited: true,
        ...updateCommentDto,
      });
    } else {
      return await this.commentRepository.update(id, {
        isEdited: true,
        ...updateCommentDto,
      });
    }
  }

  async getAllCommentsOfTweet(
    tweetId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
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
      };
    });

    return { result, count };
  }

  async isTweetCommentedByUser(tweet: Tweet, userId: string): Promise<boolean> {
    if (!userId) return false;
    const foundedComment: Comment | null = await this.commentRepository.findOne(
      {
        where: { user: { id: userId }, tweet: { id: tweet.id } },
      },
    );
    return foundedComment ? true : false;
  }
}
