import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity,
  OneToMany,
  Generated,
  PrimaryColumn,
} from 'typeorm';
import { RegisterPhone } from './register-phone.entity';
import { RegisterEmail } from './register-email.entity';
import { Authorization } from './authorization.entity';
import { bigint } from '../../../common/functions/entity';

@Entity()
export class User extends BaseEntity {
  @Generated('increment')
  @PrimaryColumn('bigint', { unsigned: true, transformer: [bigint] })
  id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, unique: true })
  phone: number;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

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
