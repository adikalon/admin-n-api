import { EntityRepository, Repository } from 'typeorm';
import { Authorization } from '../entities/authorization.entity';

@EntityRepository(Authorization)
export class AuthorizationRepository extends Repository<Authorization> {}
