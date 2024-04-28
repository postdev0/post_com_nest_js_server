import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendOTP(data: any) {
    let { email, otp } = data;
    await this.mailerService.sendMail({
      to: email,
      subject: 'OTP for verification',
      template: 'otp-verification',
      context: { otp }
    });
    return;
  }
}