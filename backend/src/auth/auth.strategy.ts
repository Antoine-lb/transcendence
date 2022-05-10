import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from "passport-42";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserEntity } from 'src/entities/users.entity';

// https://github.com/pandark/passport-42

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'OAuth2') {
  constructor(private authService: AuthService) {
    super({
        clientID: '30bcae937e1524e43ad6b11e8d2ac296212d06570d3798c4705be1f2e45432f0',
        clientSecret: 'a4b00756fcd08dc7240320150f560a08ce23fab2abb6057b76ced171e024a040',
        callbackURL: 'http://127.0.0.1:3000/api/auth/callback',
        }
    );
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const user  = {
        id: profile.id,
        username: profile.username,
        avatar: profile.photos[0].value
    };
    var ret_user : UserEntity = await this.authService.getUser(user)
    var isNew = false;
    if  (ret_user == null)
    {
      ret_user = await this.authService.addUser(user);
      isNew = true;
    }
    const ret = {
      ...ret_user,
      isNew: isNew
    }
    return ret;
  }
}