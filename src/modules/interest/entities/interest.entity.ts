import { Tweet } from "src/modules/tweet/entities/tweet.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Interest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true})
    name: string;

    @ManyToMany(() => User, user => user.interests)
    users: User[];

    @ManyToMany(() => Tweet, tweet => tweet.interests)
    tweets: Tweet[];
}