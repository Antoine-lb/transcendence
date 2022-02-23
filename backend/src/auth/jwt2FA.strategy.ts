import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { request } from 'express';

@Injectable()
export class Jwt2FAStrategy extends PassportStrategy(Strategy, 'jwt2FA') {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'REPLACE_THIS_SECRET',
      jwtFromRequest: (request) => {
            console.log('Request ' + request);
            console.log('[access_token] : ' + request.cookies['access_token']);
            console.log('[Authentication] : ' + request.cookies.Authentication);
            if (!request.user.isTwoFA)
              return request.cookies['access_token']
            return request?.cookies?.Authentication;
        }
    })
  }

  async validate(payload: TokenPayload): Promise<UserEntity> {
    console.log('[Jwt2FAStrategy]');
    console.log('[jwt strat validate] >>> payload id ' + payload.id)
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
        throw new UnauthorizedException
    delete user.secret;
    if (!user.isTwoFA) {
      return user;
    }
    if (payload.isTwoFAAuthenticated) {
      return user;
    }
    // sinon on ne retourne rien donc on ne valide pas
  }
}