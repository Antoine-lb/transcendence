import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDto } from 'src/entities/users.dto';
import { UserEntity } from 'src/entities/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
    ) {}


  async getUser(user: UserDto): Promise<UserEntity> {
    const is_user = await this.usersService.findById(user.id)
    if (!is_user)
      return null
    return is_user;
  }
  
  async addUser(user: UserDto): Promise<UserEntity> {
    const is_user = await this.usersService.findById(user.id)
    if (!is_user)
      return await this.usersService.addUser(user)
    return is_user;
  }
  
  // async checkUser(user: UserDto): Promise<UserEntity> {
  //   const is_user = await this.usersService.findById(user.id)
  //   if (!is_user)
  //     return await this.usersService.addUser(user)
  //   return is_user;
  // }

  // async getToken(user: UserEntity) {
  //   const payload = { username: user.username, sub: user.id };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async verifyToken(token: string) {
      var ret = this.jwtService.verify(token, { ignoreExpiration: false });
      // console.log("verifyToken : ", ret);
      return ret
  }

  // ajoute un arg a get token to know whether it's a 2fa token
  public getCookieWithToken(id: number, isTwoFAAuthenticated = false) {
    const payload: TokenPayload = { id, isTwoFAAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: process.env.BACKEND_JWT_SECRET,
      expiresIn: process.env.BACKEND_JWT_EXPIRATION
      // secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      // expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`
    });
    return `access_token_2fa=${token}; HttpOnly; Path=/; Max-Age=800000`;
    // return `access_token_2fa=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
  }
}
