import {
  Entity,
  CreateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { bigint } from '../../../common/functions/entity';

@Entity()
export class RegisterPhone extends BaseEntity {
  @Generated('increment')
  @PrimaryColumn('bigint', { unsigned: true, transformer: [bigint] })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  phone: number;

  @Column({ type: 'varchar', unique: true, select: false })
  code: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  userAgent: string;

  @ManyToOne(() => User, (user) => user.registerPhones, { nullable: true })
  user!: User;

  @Column({ type: 'timestamp' })
  activeTo: Date;

  @CreateDateColumn()
  createdAt: Date;
}
