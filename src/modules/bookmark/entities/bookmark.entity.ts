import { Tweet } from "src/modules/tweet/entities/tweet.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.bookmarks)
    user: User;

    @ManyToOne(() => Tweet, tweet => tweet.bookmarks)
    tweet: Tweet;
}