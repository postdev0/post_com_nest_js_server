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

  getNotifications = async (): Promise<any> => {
    return await this.notificationsRepo.find();
  };

  sendPush = async (
    id: string,
    title: string,
    body: string,
    additionalData?: Record<string, any>,
  ): Promise<void> => {
    try {
      // console.log({ FIREBASE_CREDENTIALS });
      // console.log({ serviceAccount });
      console.log("serviceAccount");
      const notification = await this.notificationTokenRepo.findOne({
        where: { user: { id }, status: 'ACTIVE' },
      });
      console.log({notification})
      if (notification) {
        await this.notificationsRepo.save({
          notification_token: notification,
          title,
          body,
          status: 'ACTIVE',
          created_by: id,
        });
        let result = await firebase
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
        console.log("result before");
        console.log({ result });
        console.log("result after");
      }
    } catch (error) {
      console.error(error);
    }
  };
}
