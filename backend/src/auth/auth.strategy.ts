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
        clientID: process.env.INTRA42_UID,
        clientSecret: process.env.INTRA42_SECRET,
        callbackURL: process.env.INTRA42_CALLBACK_URL,
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