import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { NotificationToken } from './notification-token.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => NotificationToken,
    (notificationToken) => notificationToken.notifications,
  )
  notification_token: NotificationToken;

  @Column()
  title: string;

  @Column({ type: 'jsonb', default: '{}' })
  body: any;

  @Column()
  created_by: string;

  @Column({
    default: 'ACTIVE',
  })
  status: string;
}
