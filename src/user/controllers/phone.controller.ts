import {
  Body,
  Controller,
  NotFoundException,
  Post,
  PreconditionFailedException,
  Req,
  RequestTimeoutException,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { getConnection } from 'typeorm';
import { PhoneLoginDto } from '../dto/phone-login.dto';
import { PhoneConfirmDto } from '../dto/phone-confirm.dto';
import { UserService } from '../services/user.service';
import { SuccessInterceptor } from '../../common/interceptors/success.interceptor';
import phoneConfig from '../config/phone';
import stringsExceptions from '../strings/exceptions';
import { RegisterPhone } from '../entities/register-phone.entity';
import { User } from '../entities/user.entity';
import { Authorization } from '../entities/authorization.entity';

@Controller('api/user')
export class PhoneController {
  constructor(private readonly userService: UserService) {}

  @Post('login/phone')
  @UseInterceptors(SuccessInterceptor)
  async loginPhone(@Body() payload: PhoneLoginDto): Promise<void> {
    const user = await getConnection()
      .createQueryBuilder(User, 'user')
      .where('phone = :phone', { phone: payload.phone })
      .getOne();

    let code: string;

    for (let i = 1; i <= phoneConfig.generateCodeAttempt; i++) {
      const tCode = await this.userService.phoneAuthGenerateCode();

      const rp = await getConnection()
        .createQueryBuilder(RegisterPhone, 'rp')
        .where('rp.code = :code', { code: tCode })
        .getOne();

      if (!rp) {
        code = tCode;
        break;
      }
    }

    if (!code) {
      throw new RequestTimeoutException(stringsExceptions.failGenVerCode);
    }

    await getConnection().transaction(async (transactionalEntityManager) => {
      const activeTo = new Date();
      activeTo.setSeconds(activeTo.getSeconds() + phoneConfig.activeToCode);

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(RegisterPhone)
        .values({
          phone: payload.phone,
          code: code,
          userId: user?.id,
          activeTo: activeTo,
        })
        .execute();

      // TODO: Посылаем SMS
    });
  }

  @Post('confirm/phone')
  async confirmPhone(
    @Body() payload: PhoneConfirmDto,
    @Req() req: Request,
  ): Promise<Authorization> {
    const activeTo = new Date().toISOString();

    const registerPhone = await getConnection()
      .createQueryBuilder(RegisterPhone, 'rp')
      .where('rp.code = :code', { code: payload.code })
      .andWhere('rp.activeTo > :activeTo', { activeTo })
      .leftJoinAndSelect('rp.user', 'user')
      .getOne();

    if (!registerPhone) {
      throw new NotFoundException(stringsExceptions.incOutCode);
    }

    let user = registerPhone.user;
    let authorization: Authorization;

    await getConnection().transaction(async (transactionalEntityManager) => {
      if (!user) {
        const {
          identifiers,
        } = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({ phone: registerPhone.phone })
          .execute();

        user = await transactionalEntityManager
          .createQueryBuilder(User, 'user')
          .where('user.id = :id', { id: identifiers[0].id })
          .getOne();
      }

      let token: string;

      for (let i = 1; i <= phoneConfig.generateTokenAttempt; i++) {
        const tToken = await this.userService.phoneAuthGenerateToken();

        const authorization = await getConnection()
          .createQueryBuilder(Authorization, 'authorization')
          .where('authorization.token = :token', { token: tToken })
          .getOne();

        if (!authorization) {
          token = tToken;
          break;
        }
      }

      if (!token) {
        throw new RequestTimeoutException(stringsExceptions.failGenAuthToken);
      }

      const activeTo = new Date();
      activeTo.setSeconds(activeTo.getSeconds() + phoneConfig.activeToToken);

      const { identifiers } = await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Authorization)
        .values({
          ip: req.ip,
          userAgent: req.header('user-agent'),
          token: token,
          userId: user.id,
          activeTo: activeTo,
        })
        .execute();

      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(RegisterPhone)
        .where({ id: registerPhone.id })
        .execute();

      authorization = await transactionalEntityManager
        .createQueryBuilder(Authorization, 'authorization')
        .where('authorization.id = :id', { id: identifiers[0].id })
        .leftJoinAndSelect('authorization.user', 'user')
        .addSelect('authorization.token')
        .getOne();

      if (!authorization) {
        throw new PreconditionFailedException(stringsExceptions.authFailed);
      }
    });

    return authorization;
  }
}
