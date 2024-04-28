import { Tweet } from "src/modules/tweet/entities/tweet.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Retweet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.retweets)
    user: User;

    @ManyToOne(() => Tweet, tweet => tweet.retweets)
    tweet: Tweet;
}