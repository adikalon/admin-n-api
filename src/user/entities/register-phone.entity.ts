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
export class RegisterPhone extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  phone: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.registerPhones, { nullable: true })
  user!: User;

  @CreateDateColumn()
  createdAt: Date;
}
