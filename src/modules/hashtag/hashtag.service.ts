import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Hashtag } from "./entities/hashtag.entity";
import { ILike, Repository } from "typeorm";
import { Tweet } from "../tweet/entities/tweet.entity";
import { LikeService } from "../like/like.service";
import { RetweetService } from "../retweet/retweet.service";
import { BookmarkService } from "../bookmark/bookmark.service";
import { CommentService } from "../comment/comment.service";
import { TweetsList } from "../../base/interface";

@Injectable()
export class HashtagService {
    constructor(
        @InjectRepository(Hashtag) private readonly hashtagRepository: Repository<Hashtag>,
        @InjectRepository(Tweet) private readonly tweetRepository: Repository<Tweet>,
        private readonly likeService: LikeService,
        private readonly retweetService: RetweetService,
        private readonly bookmarkService: BookmarkService,
        private readonly commentService: CommentService,
    ) { }

    async getAll(page: number = 1, pageSize: number = 10) {
        const [hashtags, total] = await this.hashtagRepository.findAndCount({
            where: {},
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { hashtags, total };
    }

    async createMultipleHashtagsByTweet(names: string[], tweetId: string): Promise<Hashtag[]> {
        const savedHashtags: Hashtag[] = [];
        for (const name of names) {
            const savedHashtag = await this.createHashtagByTweet(name, tweetId);
            savedHashtags.push(savedHashtag);
        }
        return savedHashtags;
    }

    async createHashtagByTweet(name: string, tweetId: string): Promise<any> {
        if (!name) throw new NotFoundException('Name is not given properly');
        name = name.toLowerCase();
        let tweet = await this.tweetRepository.findOne({
            where: { id: tweetId }
        });
        const existingHashtag = await this.hashtagRepository.findOne({
            where: { name },
            relations: ['tweets']
        });
        if (existingHashtag) {
            const existingHashtagForTweet = await this.hashtagRepository.findOne({
                where: { tweets: { id: tweetId } }
            });
            if (!existingHashtagForTweet) {
                existingHashtag.tweets = [...existingHashtag.tweets, tweet];
                existingHashtag.postCount++;
                return await this.hashtagRepository.save(existingHashtag);
            }
            return { message: "Tweet already have that hashtag" };
        }
        const hashtag = this.hashtagRepository.create({ name, postCount: 0 });
        hashtag.tweets = [tweet];
        hashtag.postCount++;
        return await this.hashtagRepository.save(hashtag);
    }

    async searchHashtagByNameWithTweets(name: string, selfId: string): Promise<TweetsList[]> {
        let hashtags = await this.hashtagRepository.find({
            where: { name: ILike(`%${name.toLowerCase()}%`) },
            relations: ['tweets', 'tweets.interests', 'tweets.hashtags']
        });

        let result = await Promise.all(hashtags.map(async hashtag => {
            return await Promise.all(hashtag.tweets.map(async (tweet: any) => ({
                id: tweet.id,
                text: tweet.text,
                media: tweet.media,
                interests: tweet.interests.map((i: any) => i.name),
                hashtags: tweet.hashtags.map((i: any) => i.name),
                commentsCount: tweet.commentsCount,
                retweetsCount: tweet.retweetsCount,
                likesCount: tweet.likesCount,
                bookmarksCount: tweet.bookmarksCount,
                taggedUsers: tweet.taggedUsers,
                isRetweeted: tweet.isRetweeted,
                isEdited: tweet.isEdited,
                isPublic: tweet.isPublic,
                selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
                selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, selfId),
                selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, selfId),
                selfCommented: await this.commentService.isTweetCommentedByUser(tweet, selfId),
                userId: tweet.userId,
                username: tweet.username,
                fullName: tweet.fullName,
                avatar: tweet.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt
            })));
        })).then(result => result.flat());
        return result.sort((a, b) => a.createdAt - b.createdAt);
    }

    async searchHashtagByName(name: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [result, count] = await this.hashtagRepository.findAndCount({
            where: { name: ILike(`%${name.toLowerCase()}%`) },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { result, count }
    }

    async getAllTweetsByHashtag(name: string, selfId: string): Promise<TweetsList[]> {
        let hashtags = await this.hashtagRepository.find({
            where: { name: name.toLowerCase() },
            relations: ['tweets', 'tweets.user', 'tweets.interests', 'tweets.hashtags']
        });

        let result = await Promise.all(hashtags.map(async hashtag => {
            return await Promise.all(hashtag.tweets.map(async (tweet: any) => ({
                id: tweet.id,
                text: tweet.text,
                media: tweet.media,
                interests: tweet.interests.map((i: any) => i.name),
                hashtags: tweet.hashtags.map((i: any) => i.name),
                commentsCount: tweet.commentsCount,
                retweetsCount: tweet.retweetsCount,
                likesCount: tweet.likesCount,
                bookmarksCount: tweet.bookmarksCount,
                taggedUsers: tweet.taggedUsers,
                isRetweeted: tweet.isRetweeted,
                isEdited: tweet.isEdited,
                isPublic: tweet.isPublic,
                selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
                selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, selfId),
                selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, selfId),
                selfCommented: await this.commentService.isTweetCommentedByUser(tweet, selfId),
                userId: tweet.user.userId,
                username: tweet.user.username,
                fullName: tweet.user.fullName,
                avatar: tweet.user.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt
            })));
        })).then(result => result.flat());
        return result.sort((a, b) => a.createdAt - b.createdAt);
    }

}