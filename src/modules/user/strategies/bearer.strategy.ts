import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthorizationRepository } from '../repositories/authorization.repository';
import exceptionsUser from '../strings/exceptions-user';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private authorizationRepository: AuthorizationRepository) {
    super();
  }

  async validate(token: string, done) {
    const user = await this.authorizationRepository.getUserByToken(token);

    if (user) {
      done(null, user);
    } else {
      done(new UnauthorizedException(exceptionsUser.unauthorized), false);
    }
  }
}
