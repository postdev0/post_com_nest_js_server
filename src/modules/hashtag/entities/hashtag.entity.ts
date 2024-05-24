import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Hashtag extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  postCount: number;

  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags)
  tweets: Tweet[];
}
