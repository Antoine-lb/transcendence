import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Controller, Get, Req, UseGuards, Post, Param, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ParseIntPipe, NotFoundException} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import Jwt2FAGuard from 'src/auth/jwt2FA.guard';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
// import path from 'path';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { tap, map } from 'rxjs/operators'
import { join } from 'path';
import { FriendStatus } from 'src/entities/friend-request-interface';

export const storage = {
  storage: diskStorage({
      // choose where to save the file
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, Jwt2FAGuard)
export class UserController {
  constructor( private readonly userService: UsersService
    ) {}

    
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
      return await this.userService.findAll(); //TODO: voir si je peux return que les infos public
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Post('upload') // 'file' = valeur de la variable a envoyer dans le POST
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
      const user: UserEntity = req.user;
      console.log("user : ", user);

      return this.userService.updateOne(user.id, {avatar: file.filename}).pipe(
        tap((user: UserEntity) => console.log(user)),
        map((user:UserEntity) => ({avatar: user.avatar}))
      )
      // return of({imagePath: file.filename}) // of = observable
    }

    // display avatar
    @Get('avatar/:filename')
    findProfileImage(@Param('filename') filename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/avatars/' + filename)));
    }
  }