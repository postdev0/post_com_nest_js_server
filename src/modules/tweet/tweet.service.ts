import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tweet } from "./entities/tweet.entity";
import { In, Repository } from "typeorm";
import { LikeService } from "../like/like.service";
import { RetweetService } from "../retweet/retweet.service";
import { S3Service } from "../s3/s3.service";
import { BookmarkService } from "../bookmark/bookmark.service";
import { User } from "../user/entities/user.entity";
import { CommentService } from "../comment/comment.service";
import { Follow } from "../follow/entities/follow.entity";
import { TweetsList } from "../../base/interface";
import { getUpdateObjectByAction } from "../../common/action-update";
import { extractTaggedUsers } from "../../common/common";

@Injectable()
export class TweetService {
    constructor(
        @InjectRepository(Tweet) private readonly tweetRepository: Repository<Tweet>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Follow) private readonly followRepository: Repository<Follow>,
        private readonly likeService: LikeService,
        private readonly retweetService: RetweetService,
        private readonly bookmarkService: BookmarkService,
        private readonly s3Service: S3Service,
        private readonly commentService: CommentService,
    ) { }

    async create(dto: any, user: any, media?: any[]): Promise<any> {
        let taggedUsers = extractTaggedUsers(dto.text);
        let tweetMedia: any[] = [];
        if (media) {
            await Promise.all(media.map(async m => {
                let { fileURL } = await this.s3Service.uploadImageS3(m);
                tweetMedia.push(fileURL);
            }));
        }
        let newTweet: any = this.tweetRepository.create({ media: tweetMedia, taggedUsers, ...dto });
        for (let user of taggedUsers) {
            // TODO notify each user about tags
        }
        newTweet.user = user;
        let userDetails = await this.userRepository.findOneBy({ id: user.id });
        userDetails.postCount++;
        await this.userRepository.save(userDetails);
        return await this.tweetRepository.save(newTweet);
    }

    async getById(id: string, selfId?: string): Promise<TweetsList | null> {
        let tweet = await this.tweetRepository.findOne({
            where: { id, deleteFlag: false },
            relations: ['user', 'interests', 'hashtags'],
        });
        if (!tweet) throw new NotFoundException('Tweet not found');
        if (!(tweet && tweet.user)) throw new NotFoundException('User associated with this tweet not found');
        if (tweet && tweet.user) {
            return {
                id: tweet.id,
                text: tweet.text,
                media: tweet.media,
                interests: tweet.interests.map(i => i.name),
                hashtags: tweet.hashtags.map(i => i.name),
                commentsCount: tweet.commentsCount,
                retweetsCount: tweet.retweetsCount,
                bookmarksCount: tweet.bookmarksCount,
                likesCount: tweet.likesCount,
                taggedUsers: tweet.taggedUsers,
                isRetweeted: tweet.isRetweeted,
                isEdited: tweet.isEdited,
                isPublic: tweet.isPublic,
                selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
                selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, selfId),
                selfCommented: await this.commentService.isTweetCommentedByUser(tweet, selfId),
                selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, selfId),
                userId: tweet.user.id,
                username: tweet.user.username,
                fullName: tweet.user.fullName,
                avatar: tweet.user.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt,
            };
        } else {
            return null;
        }
    }

    async getAll(selfId?: string, page: number = 1, pageSize: number = 10): Promise<any> {
        const [tweets, count] = await this.tweetRepository.findAndCount({
            where: { deleteFlag: false, isPublic: true },
            relations: ['user', 'interests', 'hashtags'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        let result: TweetsList[] = await Promise.all(tweets.map(async tweet => {
            return {
                id: tweet.id,
                text: tweet.text,
                media: tweet.media,
                interests: tweet.interests.map(i => i.name),
                hashtags: tweet.hashtags.map(i => i.name),
                commentsCount: tweet.commentsCount,
                retweetsCount: tweet.retweetsCount,
                bookmarksCount: tweet.bookmarksCount,
                likesCount: tweet.likesCount,
                taggedUsers: tweet.taggedUsers,
                isRetweeted: tweet.isRetweeted,
                isEdited: tweet.isEdited,
                isPublic: tweet.isPublic,
                selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
                selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, selfId),
                selfCommented: await this.commentService.isTweetCommentedByUser(tweet, selfId),
                selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, selfId),
                userId: tweet.user.id,
                username: tweet.user.username,
                fullName: tweet.user.fullName,
                avatar: tweet.user.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt,
            };
        }));

        return { result, count }
    }

    async updateById(id: string, updateTweetDto: any, media?: any[]): Promise<any> {
        let tweet = await this.tweetRepository.findOne({ where: { id, deleteFlag: false } });
        if (!tweet) throw new NotFoundException('Tweet not found');
        let tweetMedia: any[] = [];
        if (media) {
            await Promise.all(media.map(async m => {
                let { fileURL } = await this.s3Service.uploadImageS3(m);
                tweetMedia.push(fileURL);
            }));
            return await this.tweetRepository.update(id, { media: tweetMedia, isEdited: true, ...updateTweetDto });
        } else {
            return await this.tweetRepository.update(id, { isEdited: true, ...updateTweetDto });
        }
    }

    async updateActionById(id: string, action: string): Promise<any> {
        if (action === "DELETE") {
            let userDetails = await this.userRepository.findOneBy({ id, deleteFlag: false });
            userDetails.postCount ? userDetails.postCount-- : userDetails.postCount;
            await this.userRepository.save(userDetails);
        }
        return await this.tweetRepository.update(id, getUpdateObjectByAction(action));
    }

    async getTweetsByUserInterests(userId: string): Promise<TweetsList[]> {
        let user: any = await this.userRepository.findOne({
            where: { id: userId, deleteFlag: false },
            relations: ['interests', 'interests.tweets', 'interests.tweets.user', 'interests.tweets.interests', 'interests.tweets.hashtags']
        });

        let interestTweetsList = await Promise.all(user.interests.map(async (interest: any) => {
            return await Promise.all(interest.tweets.map(async (tweet: any) => {
                return {
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
                    selfLiked: await this.likeService.isTweetLikedByUser(tweet, userId),
                    selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, userId),
                    selfCommented: await this.commentService.isTweetCommentedByUser(tweet, userId),
                    selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, userId),
                    userId: tweet.user.id,
                    username: tweet.user.username,
                    fullName: tweet.user.fullName,
                    avatar: tweet.user.avatar,
                    createdAt: new Date(tweet.createdAt),
                    modifiedAt: new Date(tweet.modifiedAt)
                };
            }));
        }));

        interestTweetsList = interestTweetsList.flat();
        return interestTweetsList.sort((a, b) => {
            return new Date(b.tweet_createdAt).getTime() - new Date(a.tweet_createdAt).getTime();
        });
    }

    async getTweetsOfFollowers(selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let followers = await this.followRepository.find({
            where: { follower: { id: selfId } },
            relations: ['following']
        })
        let ids = followers.map((f: any) => f.following.id);
        const [tweets, count] = await this.tweetRepository.findAndCount({
            where: { user: { id: In(ids) }, deleteFlag: false },
            relations: ['user', 'interests', 'hashtags'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: TweetsList[] = await Promise.all(tweets.map(async tweet => {
            return {
                id: tweet.id,
                text: tweet.text,
                media: tweet.media,
                interests: tweet.interests.map(i => i.name),
                hashtags: tweet.hashtags.map(i => i.name),
                commentsCount: tweet.commentsCount,
                retweetsCount: tweet.retweetsCount,
                bookmarksCount: tweet.bookmarksCount,
                likesCount: tweet.likesCount,
                taggedUsers: tweet.taggedUsers,
                isRetweeted: tweet.isRetweeted,
                isEdited: tweet.isEdited,
                isPublic: tweet.isPublic,
                selfLiked: await this.likeService.isTweetLikedByUser(tweet, selfId),
                selfRetweeted: await this.retweetService.isTweetRetweetedByUser(tweet, selfId),
                selfCommented: await this.commentService.isTweetCommentedByUser(tweet, selfId),
                selfBookmarked: await this.bookmarkService.isTweetBookmarkedByUser(tweet, selfId),
                userId: tweet.user.id,
                username: tweet.user.username,
                fullName: tweet.user.fullName,
                avatar: tweet.user.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt,
            };
        }));
        return { result, count };
    }
}