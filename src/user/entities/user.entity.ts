import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { RegisterPhone } from './register-phone.entity';
import { RegisterEmail } from './register-email.entity';
import { Authorization } from './authorization.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, unique: true })
  phone: number;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  login: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => RegisterPhone, (registerPhone) => registerPhone.user)
  registerPhones: RegisterPhone[];

  @OneToMany(() => RegisterEmail, (registerEmail) => registerEmail.user)
  registerEmails: RegisterEmail[];

  @OneToMany(() => Authorization, (authorization) => authorization.user)
  authorizations: Authorization[];
}
