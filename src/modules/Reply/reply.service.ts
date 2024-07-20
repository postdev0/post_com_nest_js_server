import { Injectable, NotFoundException } from '@nestjs/common';
import { Reply } from './entities/reply.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
import { CommentService } from '../comment/comment.service';

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commentService: CommentService,
  ) {}

  async replyToComment(
    userId: string,
    commentId: string,
    replyText: string,
  ): Promise<Reply> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!comment || !user) {
      throw new NotFoundException('Comment or User not found');
    }

    const reply = new Reply();
    reply.user = user;
    reply.comment = comment;
    reply.text = replyText;
    await this.replyRepository.save(reply);
    return reply;
  }

  async likeReply(userId: string, replyId: string): Promise<Reply> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId },
      relations: ['likedBy'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!reply || !user) {
      throw new NotFoundException('Reply or User not found');
    }

    if (!reply.likedBy.some((likedUser) => likedUser.id === userId)) {
      reply.likedBy.push(user);
      reply.likesCount += 1;
      await this.replyRepository.save(reply);
    }

    return reply;
  }

  async unlikeReply(userId: string, replyId: string): Promise<Reply> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId },
      relations: ['likedBy'],
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!reply || !user) {
      throw new NotFoundException('Reply or User not found');
    }

    reply.likedBy = reply.likedBy.filter(
      (likedUser) => likedUser.id !== userId,
    );
    reply.likesCount -= 1;
    await this.replyRepository.save(reply);
    return reply;
  }

  async isReplyLiked(userId: string, replyId: string): Promise<boolean> {
    const reply = await this.replyRepository.findOne({
      where: { id: replyId },
      relations: ['likedBy'],
    });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }
    return reply.likedBy.some((likedUser) => likedUser.id === userId);
  }

  async getAllRepliesOfComment(
    selfId: string,
    commentId: string,
  ): Promise<any> {
    let [comment, count]: any = await this.commentRepository.findAndCount({
      where: { id: commentId },
      relations: ['user', 'replies', 'replies.user'],
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    // console.log(comment[0].replies);
    let result = await Promise.all(
      comment.map(async (c: any) => {
        return await Promise.all(
          c.replies.map(async (r: any) => {
            return {
              replyId: r.id,
              replyText: r.text,
              replyMedia: r.media,
              replyIsEdited: r.isEdited,
              replyLikesCount: r.likesCount,
              isReplyLiked: await this.isReplyLiked(selfId, r.id),
              replyUserId: r.user.id,
              replyUsername: r.user.username,
              replyFullName: r.user.fullName,
              replyAvatar: r.user.avatar,
              commentId: c.id,
              commentText: c.text,
              commentMedia: c.media,
              commentIsEdited: c.isEdited,
              commentIsLiked: await this.commentService.isCommentLiked(
                selfId,
                c.id,
              ),
              commentLikesCount: c.likesCount,
              commentUserId: c.user.id,
              commentUsername: c.user.username,
              commentFullName: c.user.fullName,
              commentAvatar: c.user.avatar,
              createdAt: r.createdAt,
              modifiedAt: r.modifiedAt,
            };
          }),
        );
      }),
    );

    return { result, count };
  }
}
