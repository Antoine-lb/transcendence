import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import { request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'REPLACE_THIS_SECRET',
      jwtFromRequest: (request) => {
            // console.log('Request ' + request);
            // console.log('Cookies : ' + request.cookies['access_token']);
            // console.log('Cookies : ' + request.cookies.Authentication);
            if (!request || !request.cookies) return null;
            return request.cookies['access_token'];
        }
    })
  }

  async validate(payload: any): Promise<UserEntity> {
    // console.log('[JwtStrategy] >>> payload id ' + payload.id)
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
        throw new UnauthorizedException('JwtStrategy')
    // console.log("JWT NORMAL STRATEGY VALIDATED")
    return user

    // return { userId: payload.sub, username: payload.username };
  }
}