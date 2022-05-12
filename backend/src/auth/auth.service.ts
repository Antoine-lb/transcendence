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

  async verifyToken(token: string) {
      var ret = this.jwtService.verify(token, { ignoreExpiration: true });
      return ret
  }

  // ajoute un arg a get token to know whether it's a 2fa token
  public getCookieWithToken(id: number, isTwoFAAuthenticated = false) {
    const payload: TokenPayload = { id, isTwoFAAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: process.env.BACKEND_JWT_SECRET,
      expiresIn: process.env.BACKEND_JWT_EXPIRATION
    });
    return `access_token_2fa=${token}; HttpOnly; Path=/; Max-Age=800000`;
  }
}
