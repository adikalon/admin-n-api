import { EntityRepository, Repository } from 'typeorm';
import { RegisterPhone } from '../entities/register-phone.entity';

@EntityRepository(RegisterPhone)
export class RegisterPhoneRepository extends Repository<RegisterPhone> {}
