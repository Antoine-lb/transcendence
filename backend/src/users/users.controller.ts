import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { Controller, Get, Req, UseGuards, Post, Param, Res, UseInterceptors,
  ClassSerializerInterceptor, UploadedFile, Request } from '@nestjs/common';
import { ParseIntPipe, NotFoundException} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
// import path from 'path';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { tap, map } from 'rxjs/operators'
import { join } from 'path';
import { FriendStatus } from 'src/entities/friend-request-interface';
import { FriendsService } from 'src/friends/friends.service';

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
    async getUserProfile(@Req() req, @Res() res) {
      const cookies: string = req.cookies['access_token'];

        await res.send({ user: req.user, access_token: cookies});
        return res
    }
  
    // @Get(':id/friends')
    // async getFriendsId(@Param('id', new ParseIntPipe()) id: number){
    //   const user = await this.userService.findById(id)
    //   if (!user)
    //     throw new NotFoundException('User not found')
    //   return await this.friendService.getFriends(user)
    // }

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
    // @Get('/me/avatar/:filename')
    // findProfileImage(@Param('filename') filename, @Res() res): Observable<Object> {
    //     return of(res.sendFile(join(process.cwd(), 'uploads/avatars/' + filename)));
    // }

    @Get('/me/avatar')
    async findProfileImage(@Res() res, @Request() req): Promise<any> {
      const user = this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('User not found')
      var filename = await join(process.cwd(), 'uploads/avatars/' + req.user.avatar)
      return res.sendFile(filename);
    }
  }