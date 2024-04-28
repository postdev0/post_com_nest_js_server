import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Tweet } from "../../tweet/entities/tweet.entity";

@Entity()
export class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.likes)
    user: User;

    @ManyToOne(() => Tweet, tweet => tweet.likes)
    tweet: Tweet;
}