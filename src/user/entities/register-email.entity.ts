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

  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.registerEmails, { nullable: true })
  user!: User;

  @CreateDateColumn()
  createdAt: Date;
}
