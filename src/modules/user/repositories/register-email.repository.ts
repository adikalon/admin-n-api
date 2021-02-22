import { EntityRepository, Repository } from 'typeorm';
import { RegisterEmail } from '../entities/register-email.entity';

@EntityRepository(RegisterEmail)
export class RegisterEmailRepository extends Repository<RegisterEmail> {}
