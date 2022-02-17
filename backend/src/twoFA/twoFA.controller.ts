import {
  ClassSerializerInterceptor,
  Controller,
  Header,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from '../users/users.service';
// import { UserEntity } from '../users/users.entity';
import RequestWithUser from '../auth/requestWithUser.interface';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private userService: UsersService,
    ) {}
 
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(request.user);
    return this.twoFAService.pipeQrCodeStream(response, otpauthUrl);
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