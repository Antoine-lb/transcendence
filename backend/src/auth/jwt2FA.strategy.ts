import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class Jwt2FAStrategy extends PassportStrategy(Strategy, 'jwt2FA') {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: true,
      secretOrKey: process.env.BACKEND_JWT_SECRET,
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
    }
    // sinon on ne retourne rien donc on ne valide pas
  }
}