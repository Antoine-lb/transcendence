import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class Jwt2FAStrategy extends PassportStrategy(Strategy, 'jwt2FA') {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'REPLACE_THIS_SECRET',
      jwtFromRequest: (request) => {
            if (!request.user.isTwoFA)
              return request.cookies['access_token']
            return request?.cookies?.access_token_2fa;
        }
    })
  }

  async validate(payload: TokenPayload): Promise<UserEntity> {
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
    {
      throw new UnauthorizedException('Jwt 2fa Strategy')
    }
    if (!user.isTwoFA) {
      return user;
    }
    if (payload.isTwoFAAuthenticated) {
      return user;
    }
    else {
      // console.log("2FA VALIDATION = NOT OK")
    }
    // sinon on ne retourne rien donc on ne valide pas
  }
}