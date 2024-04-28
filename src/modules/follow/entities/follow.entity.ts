import { User } from "src/modules/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Follow {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.followings)
    follower: User;

    @ManyToOne(() => User, user => user.followers)
    following: User;
}