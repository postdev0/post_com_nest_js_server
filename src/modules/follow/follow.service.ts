import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../user/entities/user.entity';
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

    async getFollowers(userId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [result, count] = await this.followRepository.findAndCount({
            where: { following: { id: userId } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { result, count };
    }

    async getFollowings(userId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        let [result, count] = await this.followRepository.findAndCount({
            where: { follower: { id: userId } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { result, count };
    }

    async isMyFollower(followingId: string, followerId: string): Promise<boolean> {
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
