import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Like } from './entities/like.entity';
import { User } from '../user/entities/user.entity';
import { FollowService } from '../follow/follow.service';
import { UsersList } from '../../base/interface';
import { NotificationService } from '../notification/notification.service';
import { CommonService } from '../common/commonService';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Tweet) private tweetRepository: Repository<Tweet>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private readonly followService: FollowService,
    private readonly notificationService: NotificationService,
    private readonly commonService: CommonService,
  ) {}

  async sendPushNotification(
    id: string,
    title: string,
    message: string,
    data?: any,
  ) {
    try {
      await this.notificationService.sendPush(id, title, message, data);
    } catch (e) {
      console.log('Error sending push notification', e);
    }
  }

  async addRemoveLike(dto: any, user: User): Promise<any> {
    const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
      where: { id: dto.tweetId, deleteFlag: false },
      relations: ['likes', 'user', 'interests', 'hashtags'],
    });
    if (!foundedTweet) throw new NotFoundException('Tweet not found');
    let { selfLiked, selfRetweeted, selfCommented, selfBookmarked } =
      await this.commonService.likeRetweetCommentBokkmarkProvider(
        foundedTweet,
        foundedTweet.user.id,
      );
    let tweetObject = {
      id: foundedTweet.id,
      text: foundedTweet.text,
      media: foundedTweet.media,
      interests: foundedTweet.interests.map((i) => i.name),
      hashtags: foundedTweet.hashtags.map((i) => i.name),
      commentsCount: foundedTweet.commentsCount,
      retweetsCount: foundedTweet.retweetsCount,
      bookmarksCount: foundedTweet.bookmarksCount,
      likesCount: foundedTweet.likesCount,
      taggedUsers: foundedTweet.taggedUsers,
      isRetweeted: foundedTweet.isRetweeted,
      isEdited: foundedTweet.isEdited,
      isPublic: foundedTweet.isPublic,
      selfLiked,
      selfRetweeted,
      selfCommented,
      selfBookmarked,
      userId: foundedTweet.user.id,
      username: foundedTweet.user.username,
      fullName: foundedTweet.user.fullName,
      avatar: foundedTweet.user.avatar,
      createdAt: foundedTweet.createdAt,
      modifiedAt: foundedTweet.modifiedAt,
    };
    const foundedLike: Like | null = await this.likeRepository.findOne({
      where: { user: { id: user.id }, tweet: { id: dto.tweetId } },
    });
    if (foundedLike) {
      await this.likeRepository.delete({ id: foundedLike.id });
      if (foundedTweet.likesCount) {
        foundedTweet.likesCount--;
        foundedTweet.likes = foundedTweet.likes.filter(
          (like) => like.id !== foundedLike.id,
        );
        await this.tweetRepository.save(foundedTweet);
      }
      return { like: false };
    } else {
      const newLike: Like = this.likeRepository.create();
      newLike.user = user;
      newLike.tweet = foundedTweet;
      await this.likeRepository.save(newLike);
      foundedTweet.likesCount++;
      foundedTweet.likes.push(newLike);
      await this.tweetRepository.save(foundedTweet);
      let notificationData = {
        notificationType: 'like',
        data: tweetObject,
      };

      this.sendPushNotification(
        foundedTweet.user.id,
        'Like update',
        `@${user.username} has liked on your tweet`,
        JSON.stringify(notificationData),
      );
      return { like: true };
    }
  }

  async getAllLikedUsersOfTweet(
    tweetId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
      where: { id: tweetId },
    });
    if (!foundedTweet) throw new NotFoundException('Tweet not found');
    const [foundedLikes, count] = await this.likeRepository.findAndCount({
      where: { tweet: { id: tweetId } },
      relations: { user: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let result: UsersList[] = await Promise.all(
      foundedLikes.flatMap(async (u) => {
        if (u.user.id !== selfId) {
          let isFollowing = await this.followService.isMyFollowing(
            u.user.id,
            selfId,
          );
          let isFollower = await this.followService.isMyFollower(
            u.user.id,
            selfId,
          );
          return {
            id: u.user.id,
            username: u.user.username,
            fullName: u.user.fullName,
            avatar: u.user.avatar,
            verified: u.user.verified,
            isFollowing,
            isFollower,
          };
        }
      }),
    ).then((result) => result.filter(Boolean));
    return { result, count };
  }

  async isTweetLikedByUser(tweet: Tweet, userId: string): Promise<boolean> {
    if (!userId) return false;
    const foundedLike: Like | null = await this.likeRepository.findOne({
      where: { user: { id: userId }, tweet: { id: tweet.id } },
    });
    return foundedLike ? true : false;
  }
}
