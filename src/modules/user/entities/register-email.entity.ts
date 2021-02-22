import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RegisterEmail extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', unique: true, select: false })
  token: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  userAgent: string;

  @ManyToOne(() => User, (user) => user.registerEmails, { nullable: true })
  user!: User;

  @Column({ type: 'timestamp' })
  activeTo: Date;

  @CreateDateColumn()
  createdAt: Date;
}
