import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Credentials, S3 } from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class S3Service {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }
    bucketName = process.env.S3_BUCKET_NAME;
    s3 = new S3Client({
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
        },
        region: process.env.S3_REGION,
    });

    async uploadImageS3(file: any, id?: string) {
        let originalFilename = file.originalname.replace(/\s+/g, "")
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
            await this.userRepository.update(id, { avatar: fileURL })
        }
        return { fileURL, message: "Profile image uploaded successfuly" };
    }

    async deleteImageS3(uniqueFilename: string, id?: string) {
        const folderPath = 'ProfileImages/';
        let command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: folderPath + uniqueFilename,
        });
        await this.s3.send(command);
        if (id) {
            await this.userRepository.update(id, { avatar: "https://res.cloudinary.com/twitter-clone-media/image/upload/v1597737557/user_wt3nrc.png" })
        }
        return { message: "Profile image deleted successfully" };
    }
}
