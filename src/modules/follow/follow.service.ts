import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../user/entities/user.entity';
import { UsersList } from '../../base/interface';
@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(Follow) private readonly followRepository: Repository<Follow>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async followUnfollowUser(followerId: string, followingId: string): Promise<any> {
        const existingFollow = await this.followRepository.findOne({ where: { follower: { id: followerId }, following: { id: followingId } } });

        if (existingFollow) {
            const [userFollower, userFollowing] = await Promise.all([
                this.userRepository.findOneBy({ id: followerId }),
                this.userRepository.findOneBy({ id: followingId }),
            ]);
            userFollower.followingCount ? userFollower.followingCount-- : userFollower.followingCount;
            userFollowing.followerCount ? userFollowing.followerCount-- : userFollowing.followerCount;
            await this.followRepository.remove(existingFollow);
            await this.userRepository.save([userFollower, userFollowing]);
            return { follow: false };
        }

        const follow = this.followRepository.create({ follower: { id: followerId }, following: { id: followingId } });
        const [userFollower, userFollowing] = await Promise.all([
            this.userRepository.findOneBy({ id: followerId }),
            this.userRepository.findOneBy({ id: followingId }),
        ]);
        userFollower.followingCount++;
        userFollowing.followerCount++;
        await this.followRepository.save(follow);
        await this.userRepository.save([userFollower, userFollowing]);
        return { follow: true };
    }

    async getFollowers(userId: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [followers, count] = await this.followRepository.findAndCount({
            where: { following: { id: userId } },
            relations: ["follower"],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: UsersList[] = await Promise.all(followers.flatMap(async u => {
            if (u.follower.id !== selfId) {
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
            }
        })).then(result => result.filter(Boolean));

        return { result, count };
    }

    async getFollowings(userId: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [followings, count] = await this.followRepository.findAndCount({
            where: { follower: { id: userId } },
            relations: ["following"],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: UsersList[] = await Promise.all(followings.flatMap(async u => {
            if (u.following.id !== selfId) {
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
            }
        })).then(result => result.filter(Boolean));

        return { result, count };
    }

    async isMyFollower(followerId: string, followingId: string): Promise<boolean> {
        const follow = await this.followRepository.findOne({
            where: { follower: { id: followerId }, following: { id: followingId } }
        });
        return !!follow;
    }

    async isMyFollowing(followingId: string, followerId: string): Promise<boolean> {
        const follow = await this.followRepository.findOne({
            where: { follower: { id: followerId }, following: { id: followingId } }
        });
        return !!follow;
    }
}
