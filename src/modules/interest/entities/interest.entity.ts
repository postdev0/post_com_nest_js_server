import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Interest extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => User, (user) => user.interests)
  users: User[];

  @ManyToMany(() => Tweet, (tweet) => tweet.interests)
  tweets: Tweet[];
}
