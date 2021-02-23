import {
  Body,
  Controller,
  NotFoundException,
  Post,
  PreconditionFailedException,
  Req,
  RequestTimeoutException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { getConnection } from 'typeorm';
import { PhoneLoginDto } from '../dto/phone-login.dto';
import { PhoneConfirmDto } from '../dto/phone-confirm.dto';
import { UserService } from '../services/user.service';
import phoneConfig from '../config/phone';
import exceptionsPhone from '../strings/exceptions-phone';
import responsesPhone from '../strings/responses-phone';
import { RegisterPhone } from '../entities/register-phone.entity';
import { User } from '../entities/user.entity';
import { Authorization } from '../entities/authorization.entity';
import { ApiResDefaultDto } from '../../../common/dto/api-res-default.dto';
import { PhoneSendCodeDto } from '../dto/phone-send-code.dto';
import { PhoneConfirmCodeDto } from '../dto/phone-confirm-code.dto';
import { BearerGuard } from '../guards/bearer.guard';

@Controller('api/user')
export class PhoneController {
  constructor(private readonly userService: UserService) {}

  @Post('login/phone')
  async loginPhone(
    @Body() payload: PhoneLoginDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<PhoneSendCodeDto>> {
    const lastSend = await getConnection()
      .createQueryBuilder(RegisterPhone, 'rp')
      .where('ip = :ip', { ip: req.ip })
      .orderBy('rp.createdAt', 'DESC')
      .getOne();

    const toDate = new Date(lastSend.createdAt);
    toDate.setSeconds(toDate.getSeconds() + phoneConfig.reSendCode);

    if (lastSend && toDate > new Date()) {
      return {
        success: false,
        message: responsesPhone.sendCodeRecently,
        data: {
          repeat: toDate,
        },
      };
    }

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
      throw new RequestTimeoutException(exceptionsPhone.failGenVerCode);
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
          ip: req.ip,
          userAgent: req.header('user-agent'),
          activeTo: activeTo,
        })
        .execute();

      // TODO: Посылаем SMS
    });

    const repeat = new Date();
    repeat.setSeconds(repeat.getSeconds() + phoneConfig.reSendCode);

    return {
      success: true,
      message: responsesPhone.sendCodeSuccess,
      data: {
        repeat: repeat,
      },
    };
  }

  @Post('confirm/phone')
  async confirmPhone(
    @Body() payload: PhoneConfirmDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<PhoneConfirmCodeDto>> {
    const activeTo = new Date().toISOString();

    const registerPhone = await getConnection()
      .createQueryBuilder(RegisterPhone, 'rp')
      .where('rp.code = :code', { code: payload.code })
      .andWhere('rp.activeTo > :activeTo', { activeTo })
      .andWhere('rp.ip = :ip', { ip: req.ip })
      .andWhere('rp.userAgent = :userAgent', {
        userAgent: req.header('user-agent'),
      })
      .leftJoinAndSelect('rp.user', 'user')
      .getOne();

    if (!registerPhone) {
      throw new NotFoundException(exceptionsPhone.incOutCode);
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
        throw new RequestTimeoutException(exceptionsPhone.failGenAuthToken);
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
        throw new PreconditionFailedException(exceptionsPhone.authFailed);
      }
    });

    return {
      success: true,
      message: responsesPhone.confirmCodeSuccess,
      data: { authorization },
    };
  }

  @Post('change/phone')
  @UseGuards(BearerGuard)
  async changePhone(@Req() req: Request): Promise<any> {
    return req.user;
  }
}
