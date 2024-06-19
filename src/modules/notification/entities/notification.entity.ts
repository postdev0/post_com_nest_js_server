import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { NotificationToken } from './notification-token.entity';
import { BaseEntity } from '../../../base/base.entity';

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => NotificationToken,
    (notificationToken) => notificationToken.notifications,
  )
  notification_token: NotificationToken;

  @Column({
    default: '',
  })
  notificationType: string;

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

  @Column({
    default: '',
  })
  additionalData: string;
}
