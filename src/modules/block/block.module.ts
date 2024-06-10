import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { BlockedUser } from './entities/block.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedUser, User])],
  providers: [BlockService],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
