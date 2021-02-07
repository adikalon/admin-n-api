import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Authorization extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.authorizations)
  user: User;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  userAgent: string;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
