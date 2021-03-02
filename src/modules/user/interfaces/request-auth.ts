import { Request } from 'express';
import { User } from '../entities/user.entity';

export interface RequestAuth extends Request {
  user: User;
}
