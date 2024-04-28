import { Tweet } from "src/modules/tweet/entities/tweet.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

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