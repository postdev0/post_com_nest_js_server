import { Injectable } from '@nestjs/common';
import { Tweet } from '../tweet/entities/tweet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../comment/entities/comment.entity';
import { Like } from '../like/entities/like.entity';
import { Retweet } from '../retweet/entities/retweet.entity';
import { Bookmark } from '../bookmark/entities/bookmark.entity';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Retweet)
    private readonly retweetRepository: Repository<Retweet>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  async likeRetweetCommentBokkmarkProvider(
    tweet: any,
    userId: string,
  ): Promise<any> {
    let selfLiked = await this.isTweetLikedByUser(tweet, userId);
    let selfRetweeted = await this.isTweetRetweetedByUser(tweet, userId);
    let selfCommented = await this.isTweetCommentedByUser(tweet, userId);
    let selfBookmarked = await this.isTweetBookmarkedByUser(tweet, userId);

    return { selfLiked, selfRetweeted, selfCommented, selfBookmarked };
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

  async isTweetLikedByUser(tweet: Tweet, userId: string): Promise<boolean> {
    if (!userId) return false;
    const foundedLike: Like | null = await this.likeRepository.findOne({
      where: { user: { id: userId }, tweet: { id: tweet.id } },
    });
    return foundedLike ? true : false;
  }

  async isTweetRetweetedByUser(tweet: Tweet, userId: string): Promise<boolean> {
    if (!userId) return false;
    const foundedRetweet: Retweet | null = await this.retweetRepository.findOne(
      {
        where: { user: { id: userId }, tweet: { id: tweet.id } },
      },
    );
    return foundedRetweet ? true : false;
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
