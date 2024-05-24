import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { Like } from './entities/like.entity';
import { User } from '../user/entities/user.entity';
import { FollowService } from '../follow/follow.service';
import { UsersList } from '../../base/interface';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Tweet) private tweetRepository: Repository<Tweet>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private readonly followService: FollowService,
  ) {}

  async addRemoveLike(dto: any, user: User): Promise<any> {
    const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
      where: { id: dto.tweetId },
      relations: ['likes'],
    });
    if (!foundedTweet) throw new NotFoundException('Tweet not found');
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
