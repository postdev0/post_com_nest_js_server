import { BaseEntity } from '../../../base/base.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { Like } from '../../like/entities/like.entity';
import { Retweet } from '../../retweet/entities/retweet.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Bookmark } from '../../bookmark/entities/bookmark.entity';
import { Interest } from '../../interest/entities/interest.entity';
import { ROLES } from '../../../enums/role.enum';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ default: '' })
  username: string;

  @Column({ default: '' })
  password: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: ROLES, default: ROLES.USER })
  role: ROLES;

  @Column({
    default:
      'https://res.cloudinary.com/twitter-clone-media/image/upload/v1597737557/user_wt3nrc.png',
  })
  avatar: string;

  @Column({
    default:
      'https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=2107&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  })
  cover: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  dob: string;

  @Column({ default: 'offline' })
  status: string;

  @Column('boolean', { default: false })
  verified: boolean;

  @Column('boolean', { default: false })
  ssoLogin: boolean;

  @Column({ default: 0 })
  followerCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ default: 0 })
  postCount: number;

  @Column({ type: 'timestamptz', default: new Date() })
  lastSeen: Date;

  // One user can have many tweets
  @OneToMany(() => Tweet, (tweet) => tweet.user)
  tweets: Tweet[];

  // One user can have many likes
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  // One user can have many retweets
  @OneToMany(() => Retweet, (retweet) => retweet.user)
  retweets: Retweet[];

  // One user can have many comments
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // One user can have many bookmarks
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  // One user can follow many other users
  @ManyToMany(() => User, { cascade: true })
  @JoinColumn()
  followings: User[];

  // Many users can have many followers
  @ManyToMany(() => User, { cascade: true })
  @JoinColumn()
  followers: User[];

  @ManyToMany(() => Interest, (interest) => interest.users)
  @JoinTable({
    name: 'user_interests',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'interestId', referencedColumnName: 'id' },
  })
  interests: Interest[];
}
