import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tweet } from "../../tweet/entities/tweet.entity";

@Entity()
export class Hashtag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ default: 0 })
    postCount: number;

    @ManyToMany(() => Tweet, tweet => tweet.hashtags)
    tweets: Tweet[];
}