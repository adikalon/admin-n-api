import { EntityRepository, Repository } from 'typeorm';
import { Authorization } from '../entities/authorization.entity';
import { User } from '../entities/user.entity';

@EntityRepository(Authorization)
export class AuthorizationRepository extends Repository<Authorization> {
  async getUserByToken(token: string): Promise<User> {
    const activeTo = new Date().toISOString();

    const authorization = await this.createQueryBuilder('authorization')
      .where('authorization.token = :token', { token })
      .andWhere('authorization.activeTo > :activeTo', { activeTo })
      .leftJoinAndSelect('authorization.user', 'user')
      .getOne();

    return authorization?.user;
  }
}
