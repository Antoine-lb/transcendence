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
      ignoreExpiration: true,
      secretOrKey: process.env.BACKEND_JWT_SECRET,
      jwtFromRequest: (request) => {
            if (!request || !request.cookies)
              return null;
            return request.cookies['access_token'];
        }
    })
  }

  async validate(payload: any): Promise<UserEntity> {
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
        throw new UnauthorizedException('JwtStrategy')
    return user
  }
}