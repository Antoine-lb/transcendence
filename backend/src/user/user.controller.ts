import { Controller, Get, Put, Post, Delete,
    UseGuards, Param, Res, Header, Req } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from './user.service'
import { User } from './user.entity';
import { UserInfos } from './user.mock';

@Controller('user')
export class UserController {
    constructor (private UserService: UserService) {}

    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.UserService.findOne(id);
    }

    @Post(':login')
    async newUser(@Param('login') login: string) {
        const userIface: UserInfos = {
			login: login,
			name: 'Coucou',
		}
        this.UserService.createUser(userIface);
    }
}
