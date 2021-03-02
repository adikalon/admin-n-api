import { EntityRepository, Repository } from 'typeorm';
import { ChangePhone } from '../entities/change-phone.entity';

@EntityRepository(ChangePhone)
export class ChangePhoneRepository extends Repository<ChangePhone> {}
