import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Tweet } from "../../tweet/entities/tweet.entity";

@Entity()
export class Bookmark {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.bookmarks)
    user: User;

    @ManyToOne(() => Tweet, tweet => tweet.bookmarks)
    tweet: Tweet;
}