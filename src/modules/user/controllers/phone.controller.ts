import {
  Body,
  ConflictException,
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
import { PhonePayloadLoginDto } from '../dto/phone-payload-login.dto';
import { PhonePayloadConfirmLoginDto } from '../dto/phone-payload-confirm-login.dto';
import { UserService } from '../services/user.service';
import configPhone from '../config/phone';
import exceptionsPhone from '../strings/exceptions-phone';
import responsesPhone from '../strings/responses-phone';
import sendingsSMS from '../strings/sendings-sms';
import { RegisterPhone } from '../entities/register-phone.entity';
import { User } from '../entities/user.entity';
import { Authorization } from '../entities/authorization.entity';
import { ApiResDefaultDto } from '../../../common/dto/api-res-default.dto';
import { PhoneSendCodeLoginDto } from '../dto/phone-send-code-login.dto';
import { PhoneConfirmCodeLoginDto } from '../dto/phone-confirm-code-login.dto';
import { PhoneConfirmCodeChangeDto } from '../dto/phone-confirm-code-change.dto';
import { BearerGuard } from '../guards/bearer.guard';
import { PhonePayloadChangeDto } from '../dto/phone-payload-change.dto';
import { PhoneSendCodeChangeDto } from '../dto/phone-send-code-change.dto';
import { ChangePhone } from '../entities/change-phone.entity';
import { RequestAuth } from '../interfaces/request-auth';
import { PhonePayloadConfirmChangeDto } from '../dto/phone-payload-confirm-change.dto';
import configUser from '../config/user';
import { SMSService } from '../../sms/services/sms.service';

@Controller('api/user')
export class PhoneController {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SMSService,
  ) {}

  @Post('login/code/phone')
  async loginCodePhone(
    @Body() payload: PhonePayloadLoginDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<PhoneSendCodeLoginDto>> {
    const lastSend = await getConnection()
      .createQueryBuilder(RegisterPhone, 'rp')
      .where('rp.ip = :ip', { ip: req.ip })
      .orderBy('rp.createdAt', 'DESC')
      .getOne();

    if (lastSend) {
      const toDate = new Date(lastSend.createdAt);
      toDate.setSeconds(toDate.getSeconds() + configPhone.reSendCodeLogin);

      if (toDate > new Date()) {
        return {
          success: false,
          message: responsesPhone.sendCodeRecentlyLogin,
          data: {
            repeat: toDate,
          },
        };
      }
    }

    const user = await getConnection()
      .createQueryBuilder(User, 'user')
      .where('phone = :phone', { phone: payload.phone })
      .getOne();

    let code: string;

    for (let i = 1; i <= configPhone.generateCodeAttemptLogin; i++) {
      const min = configPhone.confirmCodeLengthLoginMin;
      const max = configPhone.confirmCodeLengthLoginMax;
      const tCode = await this.userService.generateCodePhone(min, max);

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
      throw new RequestTimeoutException(exceptionsPhone.failGenVerCodeLogin);
    }

    await getConnection().transaction(async (transactionalEntityManager) => {
      const activeTo = new Date();
      activeTo.setSeconds(
        activeTo.getSeconds() + configPhone.activeToCodeLogin,
      );

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

      await this.smsService
        .getService()
        .send(payload.phone, sendingsSMS.codeLogin.replace('%c', code));
    });

    const repeat = new Date();
    repeat.setSeconds(repeat.getSeconds() + configPhone.reSendCodeLogin);

    return {
      success: true,
      message: responsesPhone.sendCodeSuccessLogin,
      data: {
        repeat: repeat,
      },
    };
  }

  @Post('login/confirm/phone')
  async loginConfirmPhone(
    @Body() payload: PhonePayloadConfirmLoginDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<PhoneConfirmCodeLoginDto>> {
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
      throw new NotFoundException(exceptionsPhone.incOutCodeLogin);
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

      for (let i = 1; i <= configPhone.generateTokenAttemptLogin; i++) {
        const tToken = await this.userService.generateAuthToken(
          configUser.authTokenLength,
        );

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
        throw new RequestTimeoutException(
          exceptionsPhone.failGenAuthTokenLogin,
        );
      }

      const activeTo = new Date();
      activeTo.setSeconds(activeTo.getSeconds() + configUser.activeToToken);

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
        throw new PreconditionFailedException(exceptionsPhone.authFailedLogin);
      }
    });

    return {
      success: true,
      message: responsesPhone.confirmCodeSuccessLogin,
      data: { authorization },
    };
  }

  @Post('change/code/phone')
  @UseGuards(BearerGuard)
  async changeCodePhone(
    @Body() payload: PhonePayloadChangeDto,
    @Req() req: RequestAuth,
  ): Promise<ApiResDefaultDto<PhoneSendCodeChangeDto>> {
    const lastSend = await getConnection()
      .createQueryBuilder(ChangePhone, 'cp')
      .where('cp.ip = :ip', { ip: req.ip })
      .orderBy('cp.createdAt', 'DESC')
      .getOne();

    if (lastSend) {
      const toDate = new Date(lastSend.createdAt);
      toDate.setSeconds(toDate.getSeconds() + configPhone.reSendCodeChange);

      if (toDate > new Date()) {
        return {
          success: false,
          message: responsesPhone.sendCodeRecentlyChange,
          data: {
            repeat: toDate,
          },
        };
      }
    }

    const checkUser = await getConnection()
      .createQueryBuilder(User, 'user')
      .where('phone = :phone', { phone: payload.phone })
      .getOne();

    if (checkUser) {
      throw new ConflictException(exceptionsPhone.numberIsUsedChange);
    }

    let code: string;

    for (let i = 1; i <= configPhone.generateCodeAttemptChange; i++) {
      const min = configPhone.confirmCodeLengthChangeMin;
      const max = configPhone.confirmCodeLengthChangeMax;
      const tCode = await this.userService.generateCodePhone(min, max);

      const cp = await getConnection()
        .createQueryBuilder(ChangePhone, 'cp')
        .where('cp.code = :code', { code: tCode })
        .getOne();

      if (!cp) {
        code = tCode;
        break;
      }
    }

    if (!code) {
      throw new RequestTimeoutException(exceptionsPhone.failGenVerCodeChange);
    }

    await getConnection().transaction(async (transactionalEntityManager) => {
      const activeTo = new Date();
      activeTo.setSeconds(
        activeTo.getSeconds() + configPhone.activeToCodeChange,
      );

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(ChangePhone)
        .values({
          phone: payload.phone,
          code: code,
          userId: req.user.id,
          ip: req.ip,
          userAgent: req.header('user-agent'),
          activeTo: activeTo,
        })
        .execute();

      await this.smsService
        .getService()
        .send(payload.phone, sendingsSMS.codeChange.replace('%c', code));
    });

    const repeat = new Date();
    repeat.setSeconds(repeat.getSeconds() + configPhone.reSendCodeChange);

    return {
      success: true,
      message: responsesPhone.sendCodeSuccessChange,
      data: {
        repeat: repeat,
      },
    };
  }

  @Post('change/confirm/phone')
  @UseGuards(BearerGuard)
  async changeConfirmPhone(
    @Body() payload: PhonePayloadConfirmChangeDto,
    @Req() req: RequestAuth,
  ): Promise<ApiResDefaultDto<PhoneConfirmCodeChangeDto>> {
    const activeTo = new Date().toISOString();

    const changePhone = await getConnection()
      .createQueryBuilder(ChangePhone, 'cp')
      .where('cp.code = :code', { code: payload.code })
      .andWhere('cp.activeTo > :activeTo', { activeTo })
      .andWhere('cp.ip = :ip', { ip: req.ip })
      .andWhere('cp.userId = :userId', { userId: req.user.id })
      .andWhere('cp.userAgent = :userAgent', {
        userAgent: req.header('user-agent'),
      })
      .leftJoinAndSelect('cp.user', 'user')
      .getOne();

    if (!changePhone) {
      throw new NotFoundException(exceptionsPhone.incOutCodeChange);
    }

    const user = changePhone.user;
    user.phone = changePhone.phone;

    await getConnection().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ phone: changePhone.phone })
        .where('id = :id', { id: changePhone.userId })
        .execute();

      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(ChangePhone)
        .where({ id: changePhone.id })
        .execute();
    });

    return {
      success: true,
      message: responsesPhone.confirmCodeSuccessChange,
      data: { user },
    };
  }
}
