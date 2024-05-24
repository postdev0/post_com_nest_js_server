import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class S3Service {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  bucketName = process.env.S3_BUCKET_NAME;
  s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    region: process.env.S3_REGION,
  });

  async uploadImageS3(file: any, id?: string) {
    let originalFilename = file.originalname.replace(/\s+/g, '');
    let folderPath = 'ProfileImages/';
    let uniqueFilename = `${uuidv4()}_${originalFilename}`;
    let command = new PutObjectCommand({
      Bucket: this.bucketName,
      Body: file.buffer,
      Key: folderPath + uniqueFilename,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    });
    await this.s3.send(command);
    let fileURL = `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${folderPath}${uniqueFilename}`;
    if (id) {
      await this.userRepository.update(id, { avatar: fileURL });
    }
    return { fileURL, message: 'Profile image uploaded successfuly' };
  }

  async deleteImageS3(uniqueFilename: string, id?: string) {
    const folderPath = 'ProfileImages/';
    let command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: folderPath + uniqueFilename,
    });
    await this.s3.send(command);
    if (id) {
      await this.userRepository.update(id, {
        avatar:
          'https://res.cloudinary.com/twitter-clone-media/image/upload/v1597737557/user_wt3nrc.png',
      });
    }
    return { message: 'Profile image deleted successfully' };
  }

  async uploadCoverS3(file: any, id?: string) {
    let originalFilename = file.originalname.replace(/\s+/g, '');
    let folderPath = 'CoverImages/';
    let uniqueFilename = `${uuidv4()}_${originalFilename}`;
    let command = new PutObjectCommand({
      Bucket: this.bucketName,
      Body: file.buffer,
      Key: folderPath + uniqueFilename,
      ACL: 'public-read',
      ContentDisposition: 'inline',
    });
    await this.s3.send(command);
    let fileURL = `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET_NAME}/${folderPath}${uniqueFilename}`;
    if (id) {
      await this.userRepository.update(id, { cover: fileURL });
    }
    return { fileURL, message: 'Cover image uploaded successfuly' };
  }

  async deleteCoverS3(uniqueFilename: string, id?: string) {
    const folderPath = 'CoverImages/';
    let command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: folderPath + uniqueFilename,
    });
    await this.s3.send(command);
    if (id) {
      await this.userRepository.update(id, {
        cover:
          'https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=2107&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      });
    }
    return { message: 'Cover image deleted successfully' };
  }
}
