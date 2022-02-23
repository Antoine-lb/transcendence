import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from '../users/users.service';
// import { UserEntity } from '../users/users.entity';
import RequestWithUser from '../auth/requestWithUser.interface';
import { TwoFADto } from './twoFA.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private usersService: UsersService,
    private authService: AuthService,

    ) {}
 
    // SETUP : n'est fait qu'une seule fois --- OK
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    console.log("[2fa] >>> /generate ");
    // console.log(request);
    console.log("[user] >>> ", request.user);
    console.log("[req cookies]", request.cookies);

    const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(request.user);
    return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
  }
  
  // SETUP : n'est fait qu'une seule fois --- OK
  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFA(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : TwoFADto) {
    console.log("[2fa] >>> /turn-on ")
    console.log("[twoFACode] >>> ", twoFACode)

    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    console.log("CODE IS VALID - TURNING ON 2FA ON USER");
    // turn on 2fa on user
    await this.usersService.turnOnTwoFA(request.user.id);
    console.log(request.user)
  }

  // SETUP : n'est fait qu'une seule fois --- OK
  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : TwoFADto
  ) {
    console.log("[2fa] >>> /authenticate ")
    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      console.log('>>> authenticate code non valide')
      throw new UnauthorizedException('Wrong authentication code');
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