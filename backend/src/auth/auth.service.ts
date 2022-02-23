import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { BasicUser } from 'src/users/users.dto';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../entities/users.entity';

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

  async getToken(user: UserEntity) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyToken(token: string) {
		return this.jwtService.verify(token, { ignoreExpiration: false });
	}
}