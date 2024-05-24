import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.followings)
  follower: User;

  @ManyToOne(() => User, (user) => user.followers)
  following: User;
}
