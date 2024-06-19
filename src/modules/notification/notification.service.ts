import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import * as firebase from 'firebase-admin';
import { NotificationToken } from './entities/notification-token.entity';
import { ConfigModule } from '@nestjs/config';
import admin from 'firebase-admin';
ConfigModule.forRoot();

const { FIREBASE_CREDENTIALS } = process.env;
const serviceAccount = JSON.parse(FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(NotificationToken)
    private readonly notificationTokenRepo: Repository<NotificationToken>,
  ) {}

  acceptPushNotification = async (
    user: any,
    notification_dto: any,
  ): Promise<NotificationToken> => {
    const existingToken = await this.notificationTokenRepo.findOne({
      where: {
        user: { id: user.id },
        device_type: notification_dto.device_type,
      },
    });

    if (existingToken) {
      existingToken.notification_token = notification_dto.notification_token;
      existingToken.status = 'ACTIVE';
      await this.notificationTokenRepo.save(existingToken);
      return existingToken;
    } else {
      const newToken = this.notificationTokenRepo.create({
        user: user,
        device_type: notification_dto.device_type,
        notification_token: notification_dto.notification_token,
        status: 'ACTIVE',
      });
      await this.notificationTokenRepo.save(newToken);
      return newToken;
    }
  };

  disablePushNotification = async (
    user: any,
    update_dto: any,
  ): Promise<void> => {
    try {
      await this.notificationTokenRepo.update(
        { user: { id: user.id }, device_type: update_dto.device_type },
        {
          status: 'INACTIVE',
        },
      );
    } catch (error) {
      return error;
    }
  };

  getNotificationsByUser = async (
    id: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> => {
    return await this.notificationsRepo.findAndCount({
      where: { created_by: id },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  };

  sendPush = async (
    id: string,
    notificationType: string,
    title: string,
    body: string,
    additionalData: any = {},
  ): Promise<void> => {
    const notification = await this.notificationTokenRepo.findOne({
      where: { user: { id }, status: 'ACTIVE' },
    });
    console.log({
      notification_token: notification,
      title,
      body,
      notificationType,
      status: 'ACTIVE',
      created_by: id,
      additionalData: additionalData.notificationData,
    });
    if (notification) {
      await this.notificationsRepo.save({
        notification_token: notification,
        title,
        body,
        notificationType,
        status: 'ACTIVE',
        created_by: id,
        additionalData: additionalData.notificationData,
      });
      let res = await firebase
        .messaging()
        .send({
          notification: { title, body },
          token: notification.notification_token,
          android: { priority: 'high' },
          data: additionalData,
        })
        .catch((error: any) => {
          console.error(error);
        });
      console.log({ res });
    }
  };
}
