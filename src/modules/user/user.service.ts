import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { getUpdateObjectByAction } from '../../common/action-update';
import { ChangePasswordDto, PasswordDto, UsernameDto } from './dto/update.dto';
import * as bcrypt from 'bcryptjs';
import { LikeService } from '../like/like.service';
import { RetweetService } from '../retweet/retweet.service';
import { Like } from '../like/entities/like.entity';
import { Retweet } from '../retweet/entities/retweet.entity';
import { BookmarkService } from '../bookmark/bookmark.service';
import { Bookmark } from '../bookmark/entities/bookmark.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CommentService } from '../comment/comment.service';
import { Tweet } from '../tweet/entities/tweet.entity';
import {
  TweetsList,
  UserCommentedTweetsList,
  UserData,
} from '../../base/interface';
import { FollowService } from '../follow/follow.service';
import { NotificationService } from '../notification/notification.service';
import { BlockService } from '../block/block.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
    @InjectRepository(Retweet)
    private readonly retweetRepository: Repository<Retweet>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly likeService: LikeService,
    private readonly retweetService: RetweetService,
    private readonly bookmarkService: BookmarkService,
    private readonly commentService: CommentService,
    private readonly followService: FollowService,
    private readonly notificationService: NotificationService,
    private readonly blockService: BlockService,
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

  async getAll(page: number = 1, pageSize: number = 10): Promise<any> {
    const [users, count]: any = await this.userRepository.findAndCount({
      where: { deleteFlag: false },
      relations: ['interests'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    let result: UserData = users.map((user: User) => {
      return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        interests: user.interests.map((interest: any) => interest.name),
        avatar: user.avatar,
        cover: user.cover,
        bio: user.bio,
        dob: user.dob,
        status: user.status,
        verified: user.verified,
        ssoLogin: user.ssoLogin,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        postCount: user.postCount,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        modifiedAt: user.modifiedAt,
      };
    });

    return { result, count };
  }

  async getById(id: string, selfId: string) {
    const isBlocked = await this.blockService.isBlocked(id, selfId);
    let user = await this.userRepository.findOne({
      where: { id },
      relations: ['interests'],
    });

    if (isBlocked) {
      return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: '',
        role: '',
        interests: '',
        avatar: user.avatar,
        cover: user.cover,
        bio: '',
        dob: '',
        status: '',
        verified: user.verified,
        ssoLogin: '',
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
        isFollower: false,
        isBlocked,
        postCount: 0,
        lastSeen: '',
        createdAt: '',
        modifiedAt: '',
        message: `You are blocked from following @${user.username} and viewing @${user.username}'s posts`,
      };
    }

    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      interests: user.interests.map((interest: any) => interest.name),
      avatar: user.avatar,
      cover: user.cover,
      bio: user.bio,
      dob: user.dob,
      status: user.status,
      verified: user.verified,
      ssoLogin: user.ssoLogin,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      isFollowing: await this.followService.isMyFollowing(id, selfId),
      isFollower: await this.followService.isMyFollower(id, selfId),
      isBlocked: await this.blockService.isBlocked(id, selfId),
      postCount: user.postCount,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      modifiedAt: user.modifiedAt,
    };
  }

  async getByUsername(username: string, selfId: string) {
    let user = await this.userRepository.findOne({
      where: { username },
      relations: ['interests'],
    });

    if (!user) throw new NotFoundException('User not found');
    let id = user.id;
    const isBlocked = await this.blockService.isBlocked(id, id);
    if (isBlocked) {
      return {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: '',
        role: '',
        interests: '',
        avatar: user.avatar,
        cover: user.cover,
        bio: '',
        dob: '',
        status: '',
        verified: user.verified,
        ssoLogin: '',
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
        isFollower: false,
        isBlocked,
        postCount: 0,
        lastSeen: '',
        createdAt: '',
        modifiedAt: '',
        message: `You are blocked from following @${user.username} and viewing @${user.username}'s posts`,
      };
    }
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      interests: user.interests.map((interest: any) => interest.name),
      avatar: user.avatar,
      cover: user.cover,
      bio: user.bio,
      dob: user.dob,
      status: user.status,
      verified: user.verified,
      ssoLogin: user.ssoLogin,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      isFollowing: await this.followService.isMyFollowing(id, selfId),
      isFollower: await this.followService.isMyFollower(id, selfId),
      isBlocked: await this.blockService.isBlocked(id, selfId),
      postCount: user.postCount,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      modifiedAt: user.modifiedAt,
    };
  }

  async updateById(id: string, user: any) {
    let result = await this.userRepository.update(id, user);
    if (result) {
      this.sendPushNotification(
        id,
        'update',
        'Profile update',
        'Your Profile have been updated successfully',
      );
    }
    return result;
    // let data = await this.userRepository.findOneBy({ id });
    // delete data.password;
    // return data;
  }

  async updateActionById(id: string, action: string) {
    return await this.userRepository.update(
      id,
      getUpdateObjectByAction(action),
    );
  }

  async setPassword(id: string, passwordDto: PasswordDto) {
    let password = await bcrypt.hash(passwordDto.password, 8);
    let result = await this.userRepository.update(id, { password });
    if (result) {
      this.sendPushNotification(
        id,
        'update',
        'Password setting',
        'Your Password have been set successfully',
      );
    }
    return result;
  }

  async checkUsername(usernameDto: UsernameDto, selfId: string) {
    if (!usernameDto.username) return false;
    let userDetails = await this.userRepository.findOne({
      where: { id: selfId, deleteFlag: false },
    });
    let username = await this.userRepository.findOne({
      where: { username: usernameDto.username, deleteFlag: false },
    });
    if (username) {
      return userDetails.username === username.username ? true : false;
    } else {
      return true;
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    let userDetails = await this.userRepository.findOne({
      where: { id, deleteFlag: false },
    });
    if (!userDetails) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Tweet with such id not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    let match = await bcrypt.compare(
      changePasswordDto.password,
      userDetails.password,
    );
    if (!match) throw new Error('Incorrect password');
    let password = await bcrypt.hash(changePasswordDto.password, 8);
    let result = await this.userRepository.update(userDetails.id, { password });
    if (result) {
      this.sendPushNotification(
        id,
        'update',
        'Password change',
        'Your Password have been updated successfully',
      );
    }
    return true;
  }

  async getUserTweets(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const [tweets, count] = await this.tweetRepository.findAndCount({
      where: { user: { id: userId }, deleteFlag: false },
      relations: ['user', 'interests', 'hashtags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let result: TweetsList[] = await Promise.all(
      tweets.map(async (tweet) => ({
        id: tweet.id,
        text: tweet.text,
        media: tweet.media,
        interests: tweet.interests.map((i) => i.name),
        hashtags: tweet.hashtags.map((i) => i.name),
        commentsCount: tweet.commentsCount,
        retweetsCount: tweet.retweetsCount,
        likesCount: tweet.likesCount,
        bookmarksCount: tweet.likesCount,
        taggedUsers: tweet.taggedUsers,
        isRetweeted: tweet.isRetweeted,
        isEdited: tweet.isEdited,
        isPublic: tweet.isPublic,
        selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
        selfRetweeted: await this.retweetService.isTweetRetweetedByUser(
          tweet,
          selfId,
        ),
        selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(
          tweet,
          selfId,
        ),
        selfCommented: await this.commentService.isTweetCommentedByUser(
          tweet,
          selfId,
        ),
        isFollowingToOwner: await this.followService.isMyFollowing(
          tweet.user.id,
          selfId,
        ),
        isOwnerBlocked: await this.blockService.isBlocked(
          tweet.user.id,
          selfId,
        ),
        userId: tweet.user.id,
        username: tweet.user.username,
        fullName: tweet.user.fullName,
        avatar: tweet.user.avatar,
        createdAt: tweet.createdAt,
        modifiedAt: tweet.modifiedAt,
      })),
    );
    return { result, count };
  }

  async getAllTweetsLikedByUser(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [likes, count] = await this.likeRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['tweet.user', 'tweet', 'tweet.interests', 'tweet.hashtags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    let result: TweetsList[] = await Promise.all(
      likes.map(async (l) => {
        return {
          id: l.tweet.id,
          text: l.tweet.text,
          media: l.tweet.media,
          interests: l.tweet.interests.map((i) => i.name),
          hashtags: l.tweet.hashtags.map((i) => i.name),
          commentsCount: l.tweet.commentsCount,
          retweetsCount: l.tweet.retweetsCount,
          likesCount: l.tweet.likesCount,
          bookmarksCount: l.tweet.likesCount,
          taggedUsers: l.tweet.taggedUsers,
          isRetweeted: l.tweet.isRetweeted,
          isEdited: l.tweet.isEdited,
          isPublic: l.tweet.isPublic,
          selfLiked: await this.likeService.isTweetLikedByUser(l.tweet, selfId),
          selfRetweeted: await this.retweetService.isTweetRetweetedByUser(
            l.tweet,
            selfId,
          ),
          selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(
            l.tweet,
            selfId,
          ),
          selfCommented: await this.commentService.isTweetCommentedByUser(
            l.tweet,
            selfId,
          ),
          isFollowingToOwner: await this.followService.isMyFollowing(
            l.tweet.user.id,
            selfId,
          ),
          isOwnerBlocked: await this.blockService.isBlocked(
            l.tweet.user.id,
            selfId,
          ),
          userId: l.tweet.user.id,
          username: l.tweet.user.username,
          fullName: l.tweet.user.fullName,
          avatar: l.tweet.user.avatar,
          createdAt: l.tweet.createdAt,
          modifiedAt: l.tweet.modifiedAt,
        };
      }),
    ).then((result) => result.filter(Boolean));
    return { result, count };
  }

  async getAllTweetsRetweetedByUser(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [retweets, count] = await this.retweetRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['tweet.user', 'tweet', 'tweet.interests', 'tweet.hashtags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    let result: TweetsList[] = await Promise.all(
      retweets.map(async (r) => {
        return {
          id: r.tweet.id,
          text: r.tweet.text,
          media: r.tweet.media,
          interests: r.tweet.interests.map((i) => i.name),
          hashtags: r.tweet.hashtags.map((i) => i.name),
          commentsCount: r.tweet.commentsCount,
          retweetsCount: r.tweet.retweetsCount,
          likesCount: r.tweet.likesCount,
          bookmarksCount: r.tweet.bookmarksCount,
          taggedUsers: r.tweet.taggedUsers,
          isRetweeted: r.tweet.isRetweeted,
          isEdited: r.tweet.isEdited,
          isPublic: r.tweet.isPublic,
          selfLiked: await this.likeService.isTweetLikedByUser(r.tweet, selfId),
          selfRetweeted: await this.retweetService.isTweetRetweetedByUser(
            r.tweet,
            selfId,
          ),
          selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(
            r.tweet,
            selfId,
          ),
          selfCommented: await this.commentService.isTweetCommentedByUser(
            r.tweet,
            selfId,
          ),
          isFollowingToOwner: await this.followService.isMyFollowing(
            r.tweet.user.id,
            selfId,
          ),
          isOwnerBlocked: await this.blockService.isBlocked(
            r.tweet.user.id,
            selfId,
          ),
          userId: r.tweet.user.id,
          username: r.tweet.user.username,
          fullName: r.tweet.user.fullName,
          avatar: r.tweet.user.avatar,
          createdAt: r.tweet.createdAt,
          modifiedAt: r.tweet.modifiedAt,
        };
      }),
    ).then((result) => result.filter(Boolean));

    return { result, count };
  }

  async getAllTweetsBookmarkedByUser(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [bookmarks, count] = await this.bookmarkRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['tweet.user', 'tweet', 'tweet.interests', 'tweet.hashtags'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    let result: TweetsList[] = await Promise.all(
      bookmarks.map(async (b) => {
        return {
          id: b.tweet.id,
          text: b.tweet.text,
          media: b.tweet.media,
          interests: b.tweet.interests.map((i) => i.name),
          hashtags: b.tweet.hashtags.map((i) => i.name),
          commentsCount: b.tweet.commentsCount,
          retweetsCount: b.tweet.retweetsCount,
          likesCount: b.tweet.likesCount,
          bookmarksCount: b.tweet.bookmarksCount,
          taggedUsers: b.tweet.taggedUsers,
          isRetweeted: b.tweet.isRetweeted,
          isEdited: b.tweet.isEdited,
          isPublic: b.tweet.isPublic,
          selfLiked: await this.likeService.isTweetLikedByUser(b.tweet, selfId),
          selfRetweeted: await this.retweetService.isTweetRetweetedByUser(
            b.tweet,
            selfId,
          ),
          selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(
            b.tweet,
            selfId,
          ),
          selfCommented: await this.commentService.isTweetCommentedByUser(
            b.tweet,
            selfId,
          ),
          isFollowingToOwner: await this.followService.isMyFollowing(
            b.tweet.user.id,
            selfId,
          ),
          isOwnerBlocked: await this.blockService.isBlocked(
            b.tweet.user.id,
            selfId,
          ),
          userId: b.tweet.user.id,
          username: b.tweet.user.username,
          fullName: b.tweet.user.fullName,
          avatar: b.tweet.user.avatar,
          createdAt: b.tweet.createdAt,
          modifiedAt: b.tweet.modifiedAt,
        };
      }),
    ).then((result) => result.filter(Boolean));
    return { result, count };
  }

  async getAllCommentsByUser(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [comment, count] = await this.commentRepository.findAndCount({
      where: { user: { id: userId } },
      relations: [
        'user',
        'tweet.user',
        'tweet',
        'tweet.interests',
        'tweet.hashtags',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    let result: UserCommentedTweetsList[] = await Promise.all(
      comment.map(async (c) => {
        return {
          tweet_id: c.tweet.id,
          tweet_text: c.tweet.text,
          tweet_media: c.tweet.media,
          tweet_interests: c.tweet.interests.map((i) => i.name),
          tweet_hashtags: c.tweet.hashtags.map((i) => i.name),
          tweet_commentsCount: c.tweet.commentsCount,
          tweet_retweetsCount: c.tweet.retweetsCount,
          tweet_likesCount: c.tweet.likesCount,
          tweet_bookmarksCount: c.tweet.bookmarksCount,
          tweet_taggedUsers: c.tweet.taggedUsers,
          tweet_isRetweeted: c.tweet.isRetweeted,
          tweet_isEdited: c.tweet.isEdited,
          tweet_isPublic: c.tweet.isPublic,
          tweet_selfLiked: await this.likeService.isTweetLikedByUser(
            c.tweet,
            selfId,
          ),
          tweet_selfRetweeted: await this.retweetService.isTweetRetweetedByUser(
            c.tweet,
            selfId,
          ),
          tweet_selfBookmarked:
            await this.bookmarkService.isTweetBookmarkedByUser(c.tweet, selfId),
          tweet_selfCommented: await this.commentService.isTweetCommentedByUser(
            c.tweet,
            selfId,
          ),
          tweet_isFollowingToOwner: await this.followService.isMyFollowing(
            c.tweet.user.id,
            selfId,
          ),
          tweet_isOwnerBlocked: await this.blockService.isBlocked(
            c.tweet.user.id,
            selfId,
          ),
          tweet_userId: c.tweet.user.id,
          tweet_username: c.tweet.user.username,
          tweet_fullName: c.tweet.user.fullName,
          tweet_avatar: c.tweet.user.avatar,
          tweet_createdAt: c.tweet.createdAt,
          tweet_modifiedAt: c.tweet.modifiedAt,
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
      }),
    ).then((result) => result.filter(Boolean));
    return { result, count };
  }

  /////////////////////////////////////// NOTIFICATIONS //////////////////////////////////////

  enablePush = async (id: string, update_dto: any): Promise<any> => {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return await this.notificationService.acceptPushNotification(
      user,
      update_dto,
    );
  };

  disablePush = async (id: string, update_dto: any): Promise<any> => {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return await this.notificationService.disablePushNotification(
      user,
      update_dto,
    );
  };

  getPushNotifications = async (
    id: string,
    notificationType: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> => {
    return await this.notificationService.getNotificationsByUser(
      id,
      notificationType,
      page,
      pageSize,
    );
  };
}
