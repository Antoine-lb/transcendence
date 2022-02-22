import { UsersService } from './users.service';
import { UserEntity } from './users.entity';

import { Controller, Get, Req, UseGuards, Post, Param, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import Jwt2FAGuard from 'src/auth/jwt2FA.guard';
import { Observable, of } from 'rxjs';
import { diskStorage } from 'multer';
// import path from 'path';
import path = require('path');
import { v4 as uuidv4 } from 'uuid';

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

    @Post('upload') // 'file' = valeur de la variable a envoyer dans le POST
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file): Observable<Object> {
      console.log(file);
      return of({imagePath: file.filename}) // of = observable
    }
    // @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    // @Post('upload')
    // @UseInterceptors(FileInterceptor('file', storage))
    // uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
    //     const user: User = req.user;

    //     return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
    //         tap((user: User) => console.log(user)),
    //         map((user:User) => ({profileImage: user.profileImage}))
    //     )
    // }

    // @Get('profile-image/:imagename')
    // findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
    //     return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    // }
  }