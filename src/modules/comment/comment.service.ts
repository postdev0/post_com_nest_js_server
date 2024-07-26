import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create.dto';
import { UpdateCommentDto } from './dto/update.dto';
import { Comment } from './entities/comment.entity';
import { S3Service } from '../s3/s3.service';
import { Tweet } from '../tweet/entities/tweet.entity';
import { CommentsList, TweetsList } from '../../base/interface';
import { NotificationService } from '../notification/notification.service';
import { CommonService } from '../common/commonService';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      throw e;
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
      relations: ['user'],
    });
    if (!tweet) {
      throw new NotFoundException('Tweet not found');
    }

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
        userAvator: user?.avatar,
        id: comment?.id,
        text: comment?.text || '',
        media: comment?.tweet?.media || '',
      };
      this.sendPushNotification(
        tweet.user.id,
        'tweet_comment',
        'Comment update',
        `@${user.username} has commented on your tweet`,
        { notificationData: JSON.stringify(notificationData) },
      );
    }
    return result;
  }

  async getCommentById(id: string, selfId: string): Promise<any> {
    let result = await this.commentRepository.findOne({
      where: { id },
      relations: [
        'user',
        'tweet',
        'tweet.user',
        'tweet.interests',
        'tweet.hashtags',
        'replies',
      ],
    });
    let { selfLiked, selfRetweeted, selfCommented, selfBookmarked } =
      await this.commonService.likeRetweetCommentBokkmarkProvider(
        result.tweet,
        selfId,
      );

    let tweet: TweetsList = {
      id: result.tweet.id,
      text: result.tweet.text,
      media: result.tweet.media,
      interests: result.tweet.interests.map((i) => i.name),
      hashtags: result.tweet.hashtags.map((i) => i.name),
      commentsCount: result.tweet.commentsCount,
      retweetsCount: result.tweet.retweetsCount,
      likesCount: result.tweet.bookmarksCount,
      bookmarksCount: result.tweet.likesCount,
      taggedUsers: result.tweet.taggedUsers,
      isRetweeted: result.tweet.isRetweeted,
      isEdited: result.tweet.isEdited,
      isPublic: result.tweet.isPublic,
      selfLiked,
      selfRetweeted,
      selfCommented,
      selfBookmarked,
      userId: result.tweet.user.id,
      username: result.tweet.user.username,
      fullName: result.tweet.user.fullName,
      avatar: result.tweet.user.avatar,
      createdAt: result.tweet.createdAt,
      modifiedAt: result.tweet.modifiedAt,
    };

    let comment: CommentsList = {
      id: result.id,
      text: result.text,
      media: result.media,
      isEdited: result.isEdited,
      isLiked: await this.isCommentLiked(selfId, result.id),
      likesCount: result.likesCount,
      repliesCount: result.replies.length,
      userId: result.user.id,
      username: result.user.username,
      fullName: result.user.fullName,
      avatar: result.user.avatar,
      createdAt: result.createdAt,
      modifiedAt: result.modifiedAt,
    };

    return { comment, tweet };
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
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [comment, count] = await this.commentRepository.findAndCount({
      where: { tweet: { id: tweetId } },
      relations: ['user', 'replies'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let result: CommentsList[] = await Promise.all(
      comment.map(async (c: any) => {
        return {
          id: c.id,
          text: c.text,
          media: c.media,
          isEdited: c.isEdited,
          isLiked: await this.isCommentLiked(selfId, c.id),
          likesCount: c.likesCount,
          repliesCount: c.replies.length,
          userId: c.user.id,
          username: c.user.username,
          fullName: c.user.fullName,
          avatar: c.user.avatar,
          createdAt: c.createdAt,
          modifiedAt: c.modifiedAt,
        };
      }),
    );

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

  async likeComment(userId: string, commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['likedBy', 'user', 'tweet', 'tweet.user'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!comment || !user) {
      throw new NotFoundException('Comment or User not found');
    }

    let result: any;
    if (!comment.likedBy.some((likedUser) => likedUser.id === userId)) {
      comment.likedBy.push(user);
      comment.likesCount += 1;
      result = await this.commentRepository.save(comment);
    }

    if (result) {
      let notificationData = {
        userAvator: user?.avatar,
        id: comment?.id,
        text: comment?.text || '',
        media: comment?.tweet?.media || '',
      };
      this.sendPushNotification(
        comment.user.id,
        'comment_like',
        'Comment update',
        `@${user.username} has like on your comment "${comment.text}"`,
        { notificationData: JSON.stringify(notificationData) },
      );
    }

    return comment;
  }

  async unlikeComment(userId: string, commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['likedBy'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!comment || !user) {
      throw new NotFoundException('Comment or User not found');
    }

    comment.likedBy = comment.likedBy.filter(
      (likedUser) => likedUser.id !== userId,
    );
    comment.likesCount = comment.likesCount
      ? (comment.likesCount -= 1)
      : comment.likesCount;
    await this.commentRepository.save(comment);
    return comment;
  }

  async isCommentLiked(userId: string, commentId: string): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['likedBy'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment.likedBy.some((likedUser) => likedUser.id === userId);
  }
}
