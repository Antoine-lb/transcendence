import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from '../entities/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: false,
      secretOrKey: 'REPLACE_THIS_SECRET',
      jwtFromRequest: (request) => {
            if (!request || !request.cookies) return null;
            return request.cookies['access_token'];
        }
    })
  }

  async validate(payload: any): Promise<UserEntity> {
    // console.log('payload id ' + payload.id)
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
        throw new UnauthorizedException
    return user
    
    // return { userId: payload.sub, username: payload.username };
  }
}