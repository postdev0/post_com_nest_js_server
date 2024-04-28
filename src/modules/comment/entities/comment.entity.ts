import { BaseEntity } from "src/base/base.entity";
import { Tweet } from "src/modules/tweet/entities/tweet.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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