import { UsersService } from './users.service';
import { UserEntity } from './users.entity';

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import Jwt2FAGuard from 'src/auth/jwt2FA.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, Jwt2FAGuard)
export class UserController {
  constructor( private readonly userService: UsersService
    ) {}

    
    @Get('/profile')
    getUserProfile(@Req() req) {
        return req.user;
    }

    @Get()
    async findAll(): Promise<UserEntity[]> {
      return await this.userService.findAll(); //TODO: voir si je peux return que les infos public
    }
  }