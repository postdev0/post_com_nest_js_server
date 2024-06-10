import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Notification } from './notification.entity';

@Entity()
export class NotificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notificationTokens)
  user: User;

  @Column()
  device_type: string;

  @Column()
  notification_token: string;

  @Column({
    default: 'ACTIVE',
  })
  status: string;

  @OneToMany(
    () => Notification,
    (notification) => notification.notification_token,
  )
  notifications: Notification[];
}
