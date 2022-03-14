import { Controller, ClassSerializerInterceptor, Get, Req, UseGuards, Post, Param, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../entities/users.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { FriendsService } from './friends.service'
import { ParseIntPipe, NotFoundException} from '@nestjs/common';
import { FriendStatus } from 'src/entities/friend-request-interface';


@ApiTags('friends')
@Controller('friends')
@UseGuards(JwtAuthGuard, Jwt2FAGuard)
export class FriendsController {
    constructor( private readonly userService: UsersService,
        private readonly friendService: FriendsService) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Get list of friends'})
    async getFriends(@Req() req) {
        return await this.friendService.getFriends(req.user)
    }
  
    @Get('blocked')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Get list of blocked friends'})
    async getBlockedFriends(@Req() req) {
        return await this.friendService.getBlockedFriends(req.user)
    }

    @Get('requests')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Return Pending Friend Requests'})
    async getFriendRequest(@Req() req){
      return await this.friendService.getFriendsRequests(req.user)
    }

    @Get('add/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Add (id) as a friend => POST'})
    async addNewFriend(@Req() req, @Param('username') username: string) {
        const user: UserEntity = await this.userService.findByName(username)
        if (!user)
            throw new NotFoundException('User not Found !')
      return await this.friendService.sendFriendRequest(req.user, user.id)
    }

    @Get('update/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Answer Request (id) friend => PUT'})
    async answerFriendRequest(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.respondToRequest(req.user, id, FriendStatus.STATUS_ACCEPTED)
    }

    @Get('remove/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Remove (id) friend => DELETE'})
    async removeFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.removeFriend(req.user, id)
    }

    @Get('block/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Block (id) User  => POST'})
    async blockFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.blockUser(req.user, id)
    }

    @Get('unblock/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Unblock (id) User => PUT'})
    async unblockFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
        return await this.friendService.unblockUser(req.user, id)
      }
}
