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
            // var token = request.cookies['access_token'];
            // console.log('[JwtStrategy] 1) super (constructor) >>> access_token : ');
            // if (token)
            //   console.log(token.slice(0, 15) + "..." + token.substr(-15));
            // else
            //   console.log(token);
            // token = request.cookies['access_token_2fa'];
            // console.log('[JwtStrategy] 1) super (constructor) >>> access_token_2fa : ');
            // if (token)
            //   console.log(token.slice(0, 15) + "..." + token.substr(-15));
            // else
            //   console.log(token);
            if (!request || !request.cookies)
              return null;
            return request.cookies['access_token'];
        }
    })
  }

  async validate(payload: any): Promise<UserEntity> {
		// console.log('___ Jwt validate()')
    const user: UserEntity = await this.usersService.findById(payload.id);
    if (!user)
        throw new UnauthorizedException('JwtStrategy')
    // console.log("JWT NORMAL STRATEGY VALIDATED")
    return user
  }
}