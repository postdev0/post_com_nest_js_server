import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class BlockedUser extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  blocker: User;

  @ManyToOne(() => User, (user) => user.blockedByUsers)
  blocked: User;
}
