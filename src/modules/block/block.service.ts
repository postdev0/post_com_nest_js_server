import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { BlockedUser } from './entities/block.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async blockUser(blocker: User, blocked: User): Promise<BlockedUser> {
    const existingBlock = await this.blockedUserRepository.findOne({
      where: {
        blocker: { id: blocker.id },
        blocked: { id: blocked.id },
      },
    });
    if (existingBlock) {
      return existingBlock;
    }
    const blockedUser = this.blockedUserRepository.create({ blocker, blocked });
    return this.blockedUserRepository.save(blockedUser);
  }
  
  async unblockUser(blocker: User, blocked: User): Promise<void> {
    await this.blockedUserRepository.delete({ blocker, blocked });
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blockedUser = await this.blockedUserRepository.findOne({
      where: {
        blocker: { id: blockerId },
        blocked: { id: blockedId },
      },
    });
    return !!blockedUser;
  }

  async findUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
