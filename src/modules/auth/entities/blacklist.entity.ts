import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blacklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: "" })
    refreshToken: string;
}
