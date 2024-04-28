import { ILike, Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { FollowService } from "../follow/follow.service";
import { UsersList } from "../../base/interface";

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly followService: FollowService,
    ) { }
    async searchUsersByUsername(username: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        const [users, count] = await this.userRepository.findAndCount({
            where: { username: ILike(`%${username}%`) },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        let result: UsersList[] = await Promise.all(users.map(async (u: any) => {
            if (u.id !== selfId) {
                let isFollowing = await this.followService.isMyFollowing(u.id, selfId);
                return {
                    id: u.id,
                    username: u.username,
                    fullName: u.fullName,
                    avatar: u.avatar,
                    verified: u.verified,
                    isFollowing,
                };
            }
        })).then(result => result.filter(Boolean));

        return { result, count }
    }

    async searchUsers(query: string, selfId: string, page: number = 1, pageSize: number = 10): Promise<any> {
        const [users, count] = await this.userRepository.findAndCount({
            where: [{ username: ILike(`%${query}%`) }, { fullName: ILike(`%${query}%`) }],
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        let result: UsersList[] = await Promise.all(users.map(async (u: any) => {
            if (u.id !== selfId) {
                let isFollowing = await this.followService.isMyFollowing(u.id, selfId);
                return {
                    id: u.id,
                    username: u.username,
                    fullName: u.fullName,
                    avatar: u.avatar,
                    verified: u.verified,
                    isFollowing,
                };
            }
        })).then(result => result.filter(Boolean));

        return { result, count }
    }
}