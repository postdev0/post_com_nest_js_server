import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { User } from '../../user/entities/user.entity';
import { Tweet } from '../../tweet/entities/tweet.entity';
import { Reply } from '../../Reply/entities/reply.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.comments)
  tweet: Tweet;

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[];

  @Column()
  text: string;

  @Column('simple-array', { default: '' })
  media: string[];

  @Column('boolean', { default: false })
  isEdited: boolean;

  @Column('int', { default: 0 })
  likesCount: number;

  @ManyToMany(() => User, (user) => user.likedComments)
  @JoinTable()
  likedBy: User[];
}
