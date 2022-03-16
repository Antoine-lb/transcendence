import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  Get,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Body,
  UnauthorizedException,
  ImATeapotException,
} from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from '../users/users.service';
import RequestWithUser from '../auth/requestWithUser.interface';
import { TwoFADto } from './twoFA.dto';
import { AuthService } from 'src/auth/auth.service';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('2FA')
@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private usersService: UsersService,
    private authService: AuthService,

    ) {}
 
  // SETUP : n'est fait qu'une seule fois
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() res: Response, @Req() request: RequestWithUser) {
    const qrcode = require('qrcode');
    const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(request.user);
    const ret = await qrcode.toDataURL(otpauthUrl);
    console.log("ret : ", ret)
    await res.send({ img_src : ret });
    return res;
  }
  
  // SETUP : n'est fait qu'une seule fois
  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFA(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : TwoFADto) {
    console.log("___ turn-on 2fa ___ ", twoFACode)
    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    console.log(request.user)
    if (!isCodeValid) {
      throw new ImATeapotException('Wrong authentication 2fa turn-on code');
    }
    console.log("CODE IS VALID - TURNING ON 2FA ON USER");
    // turn on 2fa on user
    await this.usersService.turnOnTwoFA(request.user.id);
  }

  @Post('turn-off')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOffTwoFA(
    @Req() request: RequestWithUser) {
    console.log("___ turn-off 2fa ___ ")
    console.log(request.user)
    await this.usersService.turnOffTwoFA(request.user.id);
  }

  // EST APPELEE A CHAQUE LOGIN si 2fa est active (isTwoFA = true)
  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : TwoFADto
  ) {
    console.log("___ 2fa authenticate (login) ___ ", twoFACode)
    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      console.log('>>> authenticate code non valide')
      throw new ImATeapotException('Wrong authentication 2fa code');
    }
    // cree cookie qui contient le token
    const accessTokenCookie = this.authService.getCookieWithToken(request.user.id, true);
    // renvoie le cookie qui contient le token dans la reponse
    request.res.setHeader('Set-Cookie', [accessTokenCookie]);
    console.log("CODE IS VALID - AUTHENTICATION OK - returning user w/ new token with full access");
 
    return request.user;
  }

  // @Post('generate')
  // @UseGuards(JwtAuthGuard)
  // async register(@Res() response: Response, @Req() req: Request) {
  //   const user: UserEntity = await this.userService.findByName(req.user['username']);
  //   console.log(">>>>>> USER");
  //   console.log(user);
  //   const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(user);
  //   // génère un QRcode
  //   return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
  // }
}