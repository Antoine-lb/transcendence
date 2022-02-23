import { Controller, Get, Req, UseGuards, Post, Param, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
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
    @ApiOperation({summary: 'Get list of friends'})
    async getFriends(@Req() req) {
        return await this.friendService.getFriends(req.user)
    }

    @Get('requests')
    @ApiOperation({summary: 'Return Pending Friend Requests'})
    async getFriendRequest(@Req() req){
      return await this.friendService.getFriendsRequests(req.user)
    }

    @Get('add/:id')
    @ApiOperation({summary: 'Add (id) as a friend'})
    async addNewFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.sendFriendRequest(req.user, id)
    }

    @Get('update/:id')
    async answerFriendRequest(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.respondToRequest(req.user, id, FriendStatus.STATUS_ACCEPTED)
    }

    @Get('remove/:id')
    async removeFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.removeFriend(req.user, id)
    }

    @Get('block/:id')
    async blockFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
      return await this.friendService.blockUser(req.user, id)
    }

    @Get('unlock/:id')
    async unblockFriend(@Req() req, @Param('id', new ParseIntPipe()) id: number) {
        return await this.friendService.unblockUser(req.user, id)
      }
}
