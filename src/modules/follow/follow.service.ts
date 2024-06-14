import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../user/entities/user.entity';
import { UsersList } from '../../base/interface';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
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

  async followUnfollowUser(
    followerId: string,
    followingId: string,
  ): Promise<any> {
    const existingFollow = await this.followRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });

    if (existingFollow) {
      const [userFollower, userFollowing] = await Promise.all([
        this.userRepository.findOneBy({ id: followerId }),
        this.userRepository.findOneBy({ id: followingId }),
      ]);
      userFollower.followingCount
        ? userFollower.followingCount--
        : userFollower.followingCount;
      userFollowing.followerCount
        ? userFollowing.followerCount--
        : userFollowing.followerCount;
      await this.followRepository.remove(existingFollow);
      await this.userRepository.save([userFollower, userFollowing]);
      return { follow: false };
    }

    const follow = this.followRepository.create({
      follower: { id: followerId },
      following: { id: followingId },
    });
    const [userFollower, userFollowing] = await Promise.all([
      this.userRepository.findOneBy({ id: followerId }),
      this.userRepository.findOneBy({ id: followingId }),
    ]);
    userFollower.followingCount++;
    userFollowing.followerCount++;
    await this.followRepository.save(follow);
    await this.userRepository.save([userFollower, userFollowing]);
    let notificationData = {
      notificationType: 'follow',
      data: followerId,
    };
    this.sendPushNotification(
      followingId,
      'Follow update',
      `@${userFollower.username} started following you`,
      JSON.stringify(notificationData),
    );
    return { follow: true };
  }

  async getFollowers(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [followers, count] = await this.followRepository.findAndCount({
      where: { following: { id: userId } },
      relations: ['follower'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let result: UsersList[] = await Promise.all(
      followers.flatMap(async (u) => {
        let isFollowing = await this.isMyFollowing(u.follower.id, selfId);
        let isFollower = await this.isMyFollower(u.follower.id, selfId);
        return {
          id: u.follower.id,
          username: u.follower.username,
          fullName: u.follower.fullName,
          avatar: u.follower.avatar,
          verified: u.follower.verified,
          isFollowing,
          isFollower,
        };
      }),
    ).then((result) => result.filter(Boolean));

    return { result, count };
  }

  async getFollowings(
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [followings, count] = await this.followRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    let result: UsersList[] = await Promise.all(
      followings.flatMap(async (u) => {
        let isFollowing = await this.isMyFollowing(u.following.id, selfId);
        let isFollower = await this.isMyFollower(u.following.id, selfId);
        return {
          id: u.following.id,
          username: u.following.username,
          fullName: u.following.fullName,
          avatar: u.following.avatar,
          verified: u.following.verified,
          isFollowing,
          isFollower,
        };
      }),
    ).then((result) => result.filter(Boolean));

    return { result, count };
  }

  async getSearchFollowers(
    searchQuery: string,
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [followers, count] = await this.followRepository.findAndCount({
      where: [
        {
          following: { id: userId },
          follower: { username: ILike(`%${searchQuery}%`) },
        },
        {
          following: { id: userId },
          follower: { fullName: ILike(`%${searchQuery}%`) },
        },
      ],
      relations: ['follower'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const uniqueFollowersMap = new Map();
    followers.forEach((u) => {
      if (!uniqueFollowersMap.has(u.follower.id)) {
        uniqueFollowersMap.set(u.follower.id, u);
      }
    });
    const uniqueFollowers = Array.from(uniqueFollowersMap.values());

    let result: UsersList[] = await Promise.all(
      uniqueFollowers.flatMap(async (u) => {
        let isFollowing = await this.isMyFollowing(u.follower.id, selfId);
        let isFollower = await this.isMyFollower(u.follower.id, selfId);
        return {
          id: u.follower.id,
          username: u.follower.username,
          fullName: u.follower.fullName,
          avatar: u.follower.avatar,
          verified: u.follower.verified,
          isFollowing,
          isFollower,
        };
      }),
    ).then((result) => result.filter(Boolean));

    return { result, count: uniqueFollowers.length };
  }

  async getSearchFollowings(
    searchQuery: string,
    userId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    let [followings, count] = await this.followRepository.findAndCount({
      where: [
        {
          follower: { id: userId },
          following: { username: ILike(`%${searchQuery}%`) },
        },
        {
          follower: { id: userId },
          following: { fullName: ILike(`%${searchQuery}%`) },
        },
      ],
      relations: ['following'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const uniqueFollowingsMap = new Map();
    followings.forEach((u) => {
      if (!uniqueFollowingsMap.has(u.following.id)) {
        uniqueFollowingsMap.set(u.following.id, u);
      }
    });
    const uniqueFollowings = Array.from(uniqueFollowingsMap.values());

    let result: UsersList[] = await Promise.all(
      uniqueFollowings.flatMap(async (u) => {
        let isFollowing = await this.isMyFollowing(u.following.id, selfId);
        let isFollower = await this.isMyFollower(u.following.id, selfId);
        return {
          id: u.following.id,
          username: u.following.username,
          fullName: u.following.fullName,
          avatar: u.following.avatar,
          verified: u.following.verified,
          isFollowing,
          isFollower,
        };
      }),
    ).then((result) => result.filter(Boolean));

    return { result, count: uniqueFollowings.length };
  }

  async isMyFollower(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    return !!follow;
  }

  async isMyFollowing(
    followingId: string,
    followerId: string,
  ): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    return !!follow;
  }
}
