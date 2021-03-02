import { EntityRepository, Repository } from 'typeorm';
import { ChangeEmail } from '../entities/change-email.entity';

@EntityRepository(ChangeEmail)
export class ChangeEmailRepository extends Repository<ChangeEmail> {}
