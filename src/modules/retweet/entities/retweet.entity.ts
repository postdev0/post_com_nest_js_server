import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Retweet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.retweets)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.retweets)
  tweet: Tweet;
}
