import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BasicUser } from 'src/users/users.dto';
import { UserEntity } from 'src/users/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
    ) {}

  async checkUser(user: BasicUser): Promise<UserEntity> {
    const is_user = await this.usersService.findByName(user.username)
    if (!is_user)
      return await this.usersService.addUser(user)
    // console.log(is_user)
    return is_user;
  }

  // async getToken(user: UserEntity) {
  //   const payload = { username: user.username, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async verifyToken(token: string) {
		return this.jwtService.verify(token, { ignoreExpiration: false });
	}

  // ajoute un arg a get token to know whether it's a 2fa token
  public getCookieWithToken(id: number, isTwoFAAuthenticated = false) {
    const payload: TokenPayload = { id, isTwoFAAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: 'REPLACE_THIS_SECRET',
      expiresIn: 800000
      // secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      // expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=800000`;
    // return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }
}
