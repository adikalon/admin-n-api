import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { bigint } from '../../../common/functions/entity';

@Entity()
export class Authorization extends BaseEntity {
  @Generated('increment')
  @PrimaryColumn('bigint', { unsigned: true, transformer: [bigint] })
  id: number;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.authorizations)
  user: User;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  userAgent: string;

  @Column({ type: 'varchar', unique: true, select: false })
  token: string;

  @Column({ type: 'timestamp' })
  activeTo: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
