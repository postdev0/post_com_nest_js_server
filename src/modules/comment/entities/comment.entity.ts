import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../../base/base.entity";
import { User } from "../../user/entities/user.entity";
import { Tweet } from "../../tweet/entities/tweet.entity";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.comments)
    user: User;

    @ManyToOne(() => Tweet, tweet => tweet.comments)
    tweet: Tweet;

    @Column()
    text: string;

    @Column('simple-array', { default: '' })
    media: string[];

    @Column('boolean', { default: false })
    isEdited: boolean;
}