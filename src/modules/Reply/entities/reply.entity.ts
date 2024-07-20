import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../base/base.entity';
import { Comment } from '../../comment/entities/comment.entity';
  
  @Entity()
  export class Reply extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, (user) => user.replies)
    user: User;
  
    @ManyToOne(() => Comment, (comment) => comment.replies)
    comment: Comment;
  
    @Column()
    text: string;
  
    @Column('simple-array', { default: '' })
    media: string[];
  
    @Column('boolean', { default: false })
    isEdited: boolean;
  
    @Column('int', { default: 0 })
    likesCount: number;
  
    @ManyToMany(() => User, (user) => user.likedReplies)
    @JoinTable()
    likedBy: User[];
  }
  