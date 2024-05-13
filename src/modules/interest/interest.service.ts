import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { User } from '../user/entities/user.entity';
import { Tweet } from '../tweet/entities/tweet.entity';
import { InterestsList, InterestsUsersList, TweetsList, UsersList } from 'src/base/interface';
import { LikeService } from '../like/like.service';
import { RetweetService } from '../retweet/retweet.service';
import { BookmarkService } from '../bookmark/bookmark.service';
import { CommentService } from '../comment/comment.service';
import { FollowService } from '../follow/follow.service';

@Injectable()
export class InterestService {
    constructor(
        @InjectRepository(Interest) private readonly interestRepository: Repository<Interest>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Tweet) private readonly tweetRepository: Repository<Tweet>,
        private readonly likeService: LikeService,
        private readonly retweetService: RetweetService,
        private readonly bookmarkService: BookmarkService,
        private readonly commentService: CommentService,
        private readonly followService: FollowService,
    ) { }

    async getAll(page: number = 1, pageSize: number = 10) {
        const skip = (page - 1) * pageSize;
        const [interests, total] = await this.interestRepository.findAndCount({
            where: {},
            relations: ['users', 'tweets'],
            skip,
            take: pageSize,
        });
        return { interests, total };
    }

    async getByName(name: string) {
        if (!name) throw new NotFoundException('Name is not given properly');
        let interest = await this.interestRepository.findOne({
            where: { name },
            relations: ['users', 'tweets']
        });
        if (!interest) throw new NotFoundException('Name not found');
        return interest;
    }

    async createMultipleInterestsByUser(names: string[], user: any): Promise<Interest[]> {
        const savedInterests: Interest[] = [];
        for (const name of names) {
            const savedInterest = await this.createInterestByUser(name, user);
            savedInterests.push(savedInterest);
        }
        return savedInterests;
    }

    async createInterestByUser(name: string, user: User): Promise<Interest> {
        if (!name) throw new NotFoundException('Name is not given properly');
        name = name.toLowerCase();
        const existingInterest = await this.interestRepository.findOne({ where: { name }, relations: ['users', 'tweets'] });
        if (existingInterest) {
            existingInterest.users = [...existingInterest.users, user];
            return await this.interestRepository.save(existingInterest);
        }
        const interest = this.interestRepository.create({ name });
        interest.users = [user];
        return await this.interestRepository.save(interest);
    }

    async createMultipleInterestsByTweet(names: string[], tweetId: string): Promise<Interest[]> {
        const savedInterests: Interest[] = [];
        for (const name of names) {
            const savedInterest = await this.createInterestByTweet(name, tweetId);
            savedInterests.push(savedInterest);
        }
        return savedInterests;
    }

    async createInterestByTweet(name: string, tweetId: string): Promise<Interest> {
        if (!name) throw new NotFoundException('Name is not given properly');
        name = name.toLowerCase();
        let tweet = await this.tweetRepository.findOne({
            where: { id: tweetId }
        });
        const existingInterest = await this.interestRepository.findOne({
            where: { name },
            relations: ['tweets']
        });
        if (existingInterest) {
            existingInterest.tweets = [...existingInterest.tweets, tweet];
            return await this.interestRepository.save(existingInterest);
        }
        const interest = this.interestRepository.create({ name });
        interest.tweets = [tweet];
        return await this.interestRepository.save(interest);
    }

    async searchInterestByNameOnlyInterest(name: string): Promise<Interest[]> {
        return await this.interestRepository.find({
            where: { name: ILike(`%${name.toLowerCase()}%`) }
        });

    }

    async searchInterestByName(name: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [interests, count] = await this.interestRepository.findAndCount({
            where: { name: ILike(`%${name.toLowerCase()}%`) },
            relations: ['users', 'tweets'],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: InterestsList[] = await Promise.all(interests.map(async interest => {
            const usersList = await Promise.all(interest.users.map(async user => {
                if (user.id !== selfId) {
                    let isFollowing = await this.followService.isMyFollowing(user.id, selfId);
                    return {
                        id: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        avatar: user.avatar,
                        verified: user.verified,
                        isFollowing,
                    }
                }
            })).then(result => result.filter(Boolean));

            const tweetsList = await Promise.all(interest.tweets.map(async (tweet: any) => ({
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

            return {
                id: interest.id,
                name: interest.name,
                users: usersList,
                tweets: tweetsList
            };
        }));
        return { result, count };
    }

    async searchInterestByNameWithTweets(name: string, selfId: string): Promise<TweetsList[]> {
        let interests = await this.interestRepository.find({
            where: { name: ILike(`%${name.toLowerCase()}%`) },
            relations: ['tweets', 'tweets.user', 'tweets.interests', 'tweets.hashtags']
        });

        let result = await Promise.all(interests.map(async interest => {
            return await Promise.all(interest.tweets.map(async (tweet: any) => ({
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
                userId: tweet.user.id,
                username: tweet.user.username,
                fullName: tweet.user.fullName,
                avatar: tweet.user.avatar,
                createdAt: tweet.createdAt,
                modifiedAt: tweet.modifiedAt
            })));
        })).then(result => result.flat());
        return result.sort((a, b) => a.createdAt - b.createdAt);
    }

    async searchInterestByNameWithUsers(name: string, selfId: string): Promise<InterestsUsersList[]> {
        let interests = await this.interestRepository.find({
            where: { name: ILike(`%${name.toLowerCase()}%`) },
            relations: ['users']
        });

        return await Promise.all(interests.map(async interest => {
            return await Promise.all(interest.users.map(async user => {
                if (user.id !== selfId) {
                    return {
                        id: interest.id,
                        name: interest.name,
                        user_id: user.id,
                        user_username: user.username,
                        user_fullName: user.fullName,
                        user_avatar: user.avatar,
                        user_verified: user.verified,
                        user_isFollowing: await this.followService.isMyFollowing(user.id, selfId),
                    }
                }
            })).then(result => result.filter(Boolean));
        })).then(result => result.flat());
    }

    async deleteMultipleInterestsByUser(names: string[], user: any): Promise<void> {
        for (const name of names) {
            await this.deleteInterestByUser(name, user);
        }
    }

    async deleteInterestByUser(name: string, user: User): Promise<void> {
        name = name.toLowerCase();
        const existingInterest = await this.interestRepository.findOne({
            where: { name },
            relations: ['users']
        });
        if (!existingInterest) {
            throw new NotFoundException('Interest not found');
        }
        if (!existingInterest.users.map(user => user.id).includes(user.id)) {
            throw new ForbiddenException('You are not a member of this interest');
        }
        await this.interestRepository.remove(existingInterest);
    }
}


