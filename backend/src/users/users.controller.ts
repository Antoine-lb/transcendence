import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';

import { Controller, Get, Post, Req, UseGuards, Param, ParseIntPipe, HttpStatus, NotFoundException} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FriendStatus } from '../entities/friend-request-interface';

import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor( private readonly userService: UsersService ) {}

    @Get('/me')
    @ApiOperation({summary: 'Return user\'s profile'})
    getUserProfile(@Req() req) {
        return req.user;
    }

    @Get('/me/friends')
    @ApiOperation({summary: 'Return accepted Friend Requests'})
    async getAllFriends(@Req() req) {
      return await this.userService.getFriends(req.user)
    }

    @Get('/me/friends-requests')
    @ApiOperation({summary: 'Return Pending Friend Requests'})
    async getFriendRequest(@Req() req){
      return await this.userService.getPendingFriends(req.user)
    }

    @Get('/me/friends/add/:id')
    @ApiOperation({summary: 'Add (id) as a friend'})
    async addNewFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      const user = await this.userService.findById(id)
      if (!user)
        throw new NotFoundException('User not found')
      return await this.userService.sendFriendRequest(req.user, id)
    }

    @Get('/me/friends/update/:id')
    async answerFriendRequest(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.userService.respondToRequest(req.user, id, FriendStatus.STATUS_ACCEPTED)
    }

    @Get('/me/friends/remove/:id')
    async removeFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.userService.removeFriend(req.user, id)
    }
  
    @Get(':id/friends')
    async getFriendsId(@Param('id', new ParseIntPipe()) id: number){
      const user = await this.userService.findById(id)
      if (!user)
        throw new NotFoundException('User not found')
      return await this.userService.getFriends(user)
    }

    @Get(':id')
    async getUserProfileId(@Param('id', new ParseIntPipe()) id: number) {
      const user = await this.userService.findById(id);
      if (!user)
      throw new NotFoundException('User not found')
      return user;
  }

    @Get()
    async findAll(): Promise<UserEntity[]> {
      return await this.userService.findAll(); 
    }
  }