import { BaseEntity } from 'src/base/base.entity';
import { Bookmark } from 'src/modules/bookmark/entities/bookmark.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Hashtag } from 'src/modules/hashtag/entities/hashtag.entity';
import { Interest } from 'src/modules/interest/entities/interest.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Retweet } from 'src/modules/retweet/entities/retweet.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Tweet extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    text: string;

    @Column('simple-array', { default: '' })
    media: string[];

    @Column({ default: 0 })
    commentsCount: number;

    @Column({ default: 0 })
    retweetsCount: number;

    @Column({ default: 0 })
    likesCount: number;

    @Column({ default: 0 })
    bookmarksCount: number;

    @Column('simple-array', { default: '' })
    taggedUsers: string[];

    @Column('boolean', { default: false })
    isRetweeted: boolean;

    @Column('boolean', { default: false })
    isEdited: boolean;

    @Column('boolean', { default: true })
    isPublic: boolean;

    // One tweet belongs to one user
    @ManyToOne(() => User, user => user.tweets)
    user: User;

    // One tweet can have many likes
    @OneToMany(() => Like, like => like.tweet)
    likes: Like[];

    // One tweet can have many retweets
    @OneToMany(() => Retweet, retweet => retweet.tweet)
    retweets: Retweet[];

    // One tweet can have many comments
    @OneToMany(() => Comment, comment => comment.tweet)
    comments: Comment[];

    // One tweet can have many bookmarks
    @OneToMany(() => Bookmark, bookmark => bookmark.tweet)
    bookmarks: Bookmark[];

    // One tweet can have many hashtags
    @ManyToMany(() => Hashtag, hashtag => hashtag.tweets)
    @JoinTable({
        name: "tweet_hashtags",
        joinColumn: { name: "tweetId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "hashtagId", referencedColumnName: "id" }
    })
    hashtags: Hashtag[];

    // Many tweets can have many interests
    @ManyToMany(() => Interest, interest => interest.tweets)
    @JoinTable({
        name: "tweet_interests",
        joinColumn: { name: "tweetId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "interestId", referencedColumnName: "id" }
    })
    interests: Interest[];
}
