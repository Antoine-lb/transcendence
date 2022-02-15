import { UsersService } from './users.service';
import { UserEntity } from './users.entity';

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';


@Controller('users')
@UseGuards(JwtAuthGuard)
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