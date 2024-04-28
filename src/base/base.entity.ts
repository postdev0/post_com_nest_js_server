import { Column } from 'typeorm';

export class BaseEntity {
    @Column('boolean', { default: true })
    activeFlag: boolean;

    @Column('boolean', { default: false })
    deleteFlag: boolean;

    @Column({ default: new Date() })
    createdAt: Date;

    @Column({ default: new Date() })
    modifiedAt: Date;
}
