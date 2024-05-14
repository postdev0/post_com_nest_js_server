import { Injectable, NotFoundException } from "@nestjs/common";
import { Tweet } from "../tweet/entities/tweet.entity";
import { Retweet } from "./entities/retweet.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { FollowService } from "../follow/follow.service";
import { UsersList } from "../../base/interface";

@Injectable()
export class RetweetService {
    constructor(
        @InjectRepository(Tweet) private tweetRepository: Repository<Tweet>,
        @InjectRepository(Retweet) private retweetRepository: Repository<Retweet>,
        private readonly followService: FollowService,
    ) { }

    async addRemoveRetweet(dto: any, user: User): Promise<any> {
        const foundedTweet: Tweet | null = await this.tweetRepository.findOne({
            where: { id: dto.tweetId },
            relations: ['retweets'],
        });
        if (!foundedTweet) throw new NotFoundException('Tweet not found');
        const foundedRetweet: Retweet | null = await this.retweetRepository.findOne({
            where: { user: { id: user.id }, tweet: { id: dto.tweetId } },
        });
        if (foundedRetweet) {
            await this.retweetRepository.delete({ id: foundedRetweet.id });
            if (foundedTweet.retweetsCount) {
                foundedTweet.retweetsCount--;
                foundedTweet.retweets = foundedTweet.retweets.filter(retweet => retweet.id !== foundedRetweet.id);
                await this.tweetRepository.save(foundedTweet);
            }
            return { retweet: false }
        } else {
            const newRetweet: Retweet = this.retweetRepository.create();
            newRetweet.user = user;
            newRetweet.tweet = foundedTweet;
            await this.retweetRepository.save(newRetweet);
            foundedTweet.retweetsCount++;
            foundedTweet.retweets.push(newRetweet)
            await this.tweetRepository.save(foundedTweet);
            return { retweet: true }
        }
    }

    async getAllRetweetedUsersOfTweet(tweetId: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        const foundedTweet: Tweet | null = await this.tweetRepository.findOne({ where: { id: tweetId } });
        if (!foundedTweet) throw new NotFoundException('Tweet not found');
        const [foundedRetweets, count] = await this.retweetRepository.findAndCount({
            where: { tweet: { id: tweetId } },
            relations: { user: true },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: UsersList[] = await Promise.all(foundedRetweets.flatMap(async u => {
            if (u.user.id !== selfId) {
                let isFollowing = await this.followService.isMyFollowing(u.user.id, selfId);
                let isFollower = await this.followService.isMyFollower(u.user.id, selfId);
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
        })).then(result => result.filter(Boolean));

        return { result, count }
    }

    async isTweetRetweetedByUser(tweet: Tweet, userId: string): Promise<boolean> {
        if (!userId) return false
        const foundedRetweet: Retweet | null = await this.retweetRepository.findOne({
            where: { user: { id: userId }, tweet: { id: tweet.id } },
        });
        return foundedRetweet ? true : false;
    }
}
