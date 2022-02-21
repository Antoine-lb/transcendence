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
import { BasicTwoFA } from './twoFA.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('2fa')
// @UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private usersService: UsersService,
    private authService: AuthService,

    ) {}
 
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    console.log("[2fa] >>> /generate ");

    const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(request.user);
    return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
  }
  
  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFA(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : BasicTwoFA) {
    console.log("[2fa] >>> /turn-on ")
    console.log("[2fa] >>> /turn-on ")

    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    // turn on 2fa on user
    await this.usersService.turnOnTwoFA(request.user.id);
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFACode } : BasicTwoFA
  ) {
    console.log("[2fa] >>> /authenticate ")
    // vérifie le code recu
    const isCodeValid = this.twoFAService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    // cree cookie qui contient le token
    const accessTokenCookie = this.authService.getCookieWithToken(request.user.id, true);
    // renvoie le cookie qui contient le token dans la reponse
    request.res.setHeader('Set-Cookie', [accessTokenCookie]);
 
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