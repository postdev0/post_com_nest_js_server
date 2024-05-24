import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.likes)
  tweet: Tweet;
}
