import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Repository } from 'typeorm';
import { Tweet } from '../tweet/entities/tweet.entity';
import { User } from '../user/entities/user.entity';
import { FollowService } from '../follow/follow.service';
import { UsersList } from '../../base/interface';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Tweet) private tweetRepository: Repository<Tweet>,
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    private readonly followService: FollowService,
  ) {}

  async addRemoveBookmark(dto: any, user: User): Promise<any> {
    const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
      where: { id: dto.tweetId },
      relations: ['bookmarks'],
    });
    if (!foundedTweet) throw new NotFoundException('Tweet not found');
    const foundedbookmark: Bookmark | null =
      await this.bookmarkRepository.findOne({
        where: { user: { id: user.id }, tweet: { id: dto.tweetId } },
      });

    if (foundedbookmark) {
      await this.bookmarkRepository.delete({ id: foundedbookmark.id });
      if (foundedTweet.bookmarksCount) {
        foundedTweet.bookmarksCount--;
        foundedTweet.bookmarks = foundedTweet.bookmarks.filter(
          (bookmark) => bookmark.id !== foundedbookmark.id,
        );
        await this.tweetRepository.save(foundedTweet);
      }
      return { bookmark: false };
    } else {
      const newBookmark: Bookmark = this.bookmarkRepository.create();
      newBookmark.user = user;
      newBookmark.tweet = foundedTweet;
      await this.bookmarkRepository.save(newBookmark);
      foundedTweet.bookmarksCount++;
      foundedTweet.bookmarks.push(newBookmark);
      await this.tweetRepository.save(foundedTweet);
      return { bookmark: true };
    }
  }

  async getAllbookmarkedUsersOfTweet(
    tweetId: string,
    selfId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
      where: { id: tweetId },
    });
    if (!foundedTweet) throw new NotFoundException('Tweet not found');
    const [foundedbookmarks, count] =
      await this.bookmarkRepository.findAndCount({
        where: { tweet: { id: tweetId } },
        relations: { user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    let result: UsersList[] = await Promise.all(
      foundedbookmarks.flatMap(async (u) => {
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

  async isTweetBookmarkedByUser(
    tweet: Tweet,
    userId: string,
  ): Promise<boolean> {
    if (!userId) return false;
    const foundedBookmark: Bookmark | null =
      await this.bookmarkRepository.findOne({
        where: { user: { id: userId }, tweet: { id: tweet.id } },
      });
    return foundedBookmark ? true : false;
  }
}
