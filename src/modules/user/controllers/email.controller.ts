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
import { UserService } from '../services/user.service';
import configEmail from '../config/email';
import exceptionsEmail from '../strings/exceptions-email';
import responsesEmail from '../strings/responses-email';
import { User } from '../entities/user.entity';
import { Authorization } from '../entities/authorization.entity';
import { ApiResDefaultDto } from '../../../common/dto/api-res-default.dto';
import { BearerGuard } from '../guards/bearer.guard';
import { RequestAuth } from '../interfaces/request-auth';
import { EmailPayloadLoginDto } from '../dto/email-payload-login.dto';
import { EmailSendCodeLoginDto } from '../dto/email-send-code-login.dto';
import { RegisterEmail } from '../entities/register-email.entity';
import { EmailPayloadConfirmLoginDto } from '../dto/email-payload-confirm-login.dto';
import { EmailConfirmCodeLoginDto } from '../dto/email-confirm-code-login.dto';
import configUser from '../config/user';
import { EmailPayloadChangeDto } from '../dto/email-payload-change.dto';
import { EmailSendCodeChangeDto } from '../dto/email-send-code-change.dto';
import { ChangeEmail } from '../entities/change-email.entity';
import { EmailConfirmCodeChangeDto } from '../dto/email-confirm-code-change.dto';
import { EmailPayloadConfirmChangeDto } from '../dto/email-payload-confirm-change.dto';

@Controller('api/user')
export class EmailController {
  constructor(private readonly userService: UserService) {}

  @Post('login/code/email')
  async loginCodeEmail(
    @Body() payload: EmailPayloadLoginDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<EmailSendCodeLoginDto>> {
    const lastSend = await getConnection()
      .createQueryBuilder(RegisterEmail, 're')
      .where('re.ip = :ip', { ip: req.ip })
      .orderBy('re.createdAt', 'DESC')
      .getOne();

    if (lastSend) {
      const toDate = new Date(lastSend.createdAt);
      toDate.setSeconds(toDate.getSeconds() + configEmail.reSendCodeLogin);

      if (toDate > new Date()) {
        return {
          success: false,
          message: responsesEmail.sendCodeRecentlyLogin,
          data: {
            repeat: toDate,
          },
        };
      }
    }

    const user = await getConnection()
      .createQueryBuilder(User, 'user')
      .where('email = :email', { email: payload.email })
      .getOne();

    let code: string;

    for (let i = 1; i <= configEmail.generateCodeAttemptLogin; i++) {
      const length = configEmail.confirmCodeLengthLogin;
      const tCode = await this.userService.generateCodeEmail(length);

      const re = await getConnection()
        .createQueryBuilder(RegisterEmail, 're')
        .where('re.code = :code', { code: tCode })
        .getOne();

      if (!re) {
        code = tCode;
        break;
      }
    }

    if (!code) {
      throw new RequestTimeoutException(exceptionsEmail.failGenVerCodeLogin);
    }

    await getConnection().transaction(async (transactionalEntityManager) => {
      const activeTo = new Date();
      activeTo.setSeconds(
        activeTo.getSeconds() + configEmail.activeToCodeLogin,
      );

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(RegisterEmail)
        .values({
          email: payload.email,
          code: code,
          userId: user?.id,
          ip: req.ip,
          userAgent: req.header('user-agent'),
          activeTo: activeTo,
        })
        .execute();

      // TODO: Посылаем EMAIL
    });

    const repeat = new Date();
    repeat.setSeconds(repeat.getSeconds() + configEmail.reSendCodeLogin);

    return {
      success: true,
      message: responsesEmail.sendCodeSuccessLogin,
      data: {
        repeat: repeat,
      },
    };
  }

  @Post('login/confirm/email')
  async loginConfirmEmail(
    @Body() payload: EmailPayloadConfirmLoginDto,
    @Req() req: Request,
  ): Promise<ApiResDefaultDto<EmailConfirmCodeLoginDto>> {
    const activeTo = new Date().toISOString();

    const registerEmail = await getConnection()
      .createQueryBuilder(RegisterEmail, 're')
      .where('re.code = :code', { code: payload.code })
      .andWhere('re.activeTo > :activeTo', { activeTo })
      .andWhere('re.ip = :ip', { ip: req.ip })
      .andWhere('re.userAgent = :userAgent', {
        userAgent: req.header('user-agent'),
      })
      .leftJoinAndSelect('re.user', 'user')
      .getOne();

    if (!registerEmail) {
      throw new NotFoundException(exceptionsEmail.incOutCodeLogin);
    }

    let user = registerEmail.user;
    let authorization: Authorization;

    await getConnection().transaction(async (transactionalEntityManager) => {
      if (!user) {
        const {
          identifiers,
        } = await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({ email: registerEmail.email })
          .execute();

        user = await transactionalEntityManager
          .createQueryBuilder(User, 'user')
          .where('user.id = :id', { id: identifiers[0].id })
          .getOne();
      }

      let token: string;

      for (let i = 1; i <= configEmail.generateTokenAttemptLogin; i++) {
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
          exceptionsEmail.failGenAuthTokenLogin,
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
        .from(RegisterEmail)
        .where({ id: registerEmail.id })
        .execute();

      authorization = await transactionalEntityManager
        .createQueryBuilder(Authorization, 'authorization')
        .where('authorization.id = :id', { id: identifiers[0].id })
        .leftJoinAndSelect('authorization.user', 'user')
        .addSelect('authorization.token')
        .getOne();

      if (!authorization) {
        throw new PreconditionFailedException(exceptionsEmail.authFailedLogin);
      }
    });

    return {
      success: true,
      message: responsesEmail.confirmCodeSuccessLogin,
      data: { authorization },
    };
  }

  @Post('change/code/email')
  @UseGuards(BearerGuard)
  async changeCodeEmail(
    @Body() payload: EmailPayloadChangeDto,
    @Req() req: RequestAuth,
  ): Promise<ApiResDefaultDto<EmailSendCodeChangeDto>> {
    const lastSend = await getConnection()
      .createQueryBuilder(ChangeEmail, 'ce')
      .where('ce.ip = :ip', { ip: req.ip })
      .orderBy('ce.createdAt', 'DESC')
      .getOne();

    if (lastSend) {
      const toDate = new Date(lastSend.createdAt);
      toDate.setSeconds(toDate.getSeconds() + configEmail.reSendCodeChange);

      if (toDate > new Date()) {
        return {
          success: false,
          message: responsesEmail.sendCodeRecentlyChange,
          data: {
            repeat: toDate,
          },
        };
      }
    }

    const checkUser = await getConnection()
      .createQueryBuilder(User, 'user')
      .where('email = :email', { email: payload.email })
      .getOne();

    if (checkUser) {
      throw new ConflictException(exceptionsEmail.emailIsUsedChange);
    }

    let code: string;

    for (let i = 1; i <= configEmail.generateCodeAttemptChange; i++) {
      const length = configEmail.confirmCodeLengthChange;
      const tCode = await this.userService.generateCodeEmail(length);

      const ce = await getConnection()
        .createQueryBuilder(ChangeEmail, 'ce')
        .where('ce.code = :code', { code: tCode })
        .getOne();

      if (!ce) {
        code = tCode;
        break;
      }
    }

    if (!code) {
      throw new RequestTimeoutException(exceptionsEmail.failGenVerCodeChange);
    }

    await getConnection().transaction(async (transactionalEntityManager) => {
      const activeTo = new Date();
      activeTo.setSeconds(
        activeTo.getSeconds() + configEmail.activeToCodeChange,
      );

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(ChangeEmail)
        .values({
          email: payload.email,
          code: code,
          userId: req.user.id,
          ip: req.ip,
          userAgent: req.header('user-agent'),
          activeTo: activeTo,
        })
        .execute();

      // TODO: Посылаем EMAIL
    });

    const repeat = new Date();
    repeat.setSeconds(repeat.getSeconds() + configEmail.reSendCodeChange);

    return {
      success: true,
      message: responsesEmail.sendCodeSuccessChange,
      data: {
        repeat: repeat,
      },
    };
  }

  @Post('change/confirm/email')
  @UseGuards(BearerGuard)
  async changeConfirmEmail(
    @Body() payload: EmailPayloadConfirmChangeDto,
    @Req() req: RequestAuth,
  ): Promise<ApiResDefaultDto<EmailConfirmCodeChangeDto>> {
    const activeTo = new Date().toISOString();

    const changeEmail = await getConnection()
      .createQueryBuilder(ChangeEmail, 'ce')
      .where('ce.code = :code', { code: payload.code })
      .andWhere('ce.activeTo > :activeTo', { activeTo })
      .andWhere('ce.ip = :ip', { ip: req.ip })
      .andWhere('ce.userId = :userId', { userId: req.user.id })
      .andWhere('ce.userAgent = :userAgent', {
        userAgent: req.header('user-agent'),
      })
      .leftJoinAndSelect('ce.user', 'user')
      .getOne();

    if (!changeEmail) {
      throw new NotFoundException(exceptionsEmail.incOutCodeChange);
    }

    const user = changeEmail.user;
    user.email = changeEmail.email;

    await getConnection().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .createQueryBuilder()
        .update(User)
        .set({ email: changeEmail.email })
        .where('id = :id', { id: changeEmail.userId })
        .execute();

      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(ChangeEmail)
        .where({ id: changeEmail.id })
        .execute();
    });

    return {
      success: true,
      message: responsesEmail.confirmCodeSuccessChange,
      data: { user },
    };
  }
}
