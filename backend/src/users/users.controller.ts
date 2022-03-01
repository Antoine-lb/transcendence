import { UsersService } from './users.service';
import { UserEntity } from '../entities/users.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Req, UseGuards, Post, Param, Delete, Res, UseInterceptors,
  ClassSerializerInterceptor, UploadedFile, Request, HttpCode } from '@nestjs/common';
import { ParseIntPipe, NotFoundException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Jwt2FAGuard } from 'src/auth/jwt2FA.guard';
import { diskStorage } from 'multer';
import path = require('path');
import { Response } from 'express';

import { join } from 'path';

type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';
export const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes: validMimeType[] = validMimeTypes;
  const fileSize = parseInt(req.headers['content-length']);
  if (allowedMimeTypes.includes(file.mimetype) == true && (fileSize < 500000))
    cb(null, true)
  else
    cb(null, false)
};

// for front : enctype="multipart/form-data"
export const uploadOptions = {
  storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
          const filename: string = req.user.id;
          const extension: string = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`)
      }
  }),
  fileFilter: imageFileFilter
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, Jwt2FAGuard)
export class UserController {
  constructor( private readonly userService: UsersService
    ) {}

    
    @Get('/me')
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({summary: 'Return user\'s profile'})
    getUserProfile(@Req() req) {
        return req.user;
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
    @Post('/me/upload-avatar') // 'file' = valeur de la variable a envoyer dans le POST
    @UseInterceptors(FileInterceptor('file', uploadOptions))
    async uploadImage(@UploadedFile() file, @Request() req): Promise<any> {
      console.log("uploaded file : ", file);
      const user: UserEntity = req.user;
      if (!user)
        throw new NotFoundException('User not found')
      if (!file)
        throw new NotFoundException('Upload: file not valid')
      // console.log("...deleting and saving to database")
      await this.userService.deleteSimilarFiles(file.filename)
      var filepath = await join(process.cwd(), 'uploads/avatars/' + file.filename)
      return await this.userService.updateParams(user.id, { avatar: filepath })
    }
 
    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get('/me/avatar')
    async findProfileImage(@Res() res, @Request() req): Promise<any> {
      const user= this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('User not found')
      console.log('/me/avatar filepath : ', req.user.avatar)
      if (await this.userService.fileExists(req.user.avatar) == false)
        throw new NotFoundException('Cannot display avatar - File does not exists')
      return res.sendFile(req.user.avatar);
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Post('/me/update-username')
    async updateUsername(@Res() res: Response, @Request() req): Promise<any> {
      const username = req.body.username 
      if (!username)
        throw new NotFoundException('Username not received')
      const userEnt: UserEntity = req.user;
      if (!userEnt)
        throw new NotFoundException('User not found 1')
      const userEntfind = this.userService.findById(req.user.id);
      if (!userEntfind)
        throw new NotFoundException('User not found 2')
      const new_username = await this.userService.usernameAddSuffix(username);
      // console.log("before return : ", new_username)
      await this.userService.updateParams(req.user.id, { username: new_username })
      await res.send({ user: req.user });
      // console.log(res)
      return res
      // ou redirige pour eviter une pending request
      // res.redirect('/api/users/me');
    }

    @UseGuards(JwtAuthGuard, Jwt2FAGuard)
    @Get('/me/delete-avatar')
    async deleteAvatar(@Res() res, @Request() req): Promise<any> {
      const user = this.userService.findById(req.user.id);
      if (!user)
        throw new NotFoundException('User not found')
      // delete l'avatar
      if (await this.userService.fileExists(req.user.avatar) == false)
        throw new NotFoundException('Cannot delete avatar - File does not exists')
      if (await this.userService.deleteFile(req.user.avatar) == false)
        throw new NotFoundException('failed to delete')
      // prepare un nouvel avatar par defaut
      const userEnt: UserEntity = req.user;
      if (!userEnt)
        throw new NotFoundException('User not found')
      var defaultpath = await join(process.cwd(), 'images/avatar_default.png')
      if (await this.userService.fileExists(defaultpath) == false)
        throw new NotFoundException('Cannot set default avatar - File does not exists')
      // update le user avec l'avatar
      await this.userService.updateParams(userEnt.id, {avatar: defaultpath})
      await res.send({ user: req.user });
      // console.log(res)
      return res
      // ou redirige pour eviter une pending request
      // res.redirect('/api/users/me');
    }

    // route qui valide les parametres et l'enregistre dans la base de donnees
    // @Get('/me/update-params')
    // async setUserParams(@Res() res, @Request() req, @Param('username') username: string, @Param('avatar') avatar: string) {
    //   const user = await this.userService.findById(id);
    //   if (!user)
    //     throw new NotFoundException('params : User not found')
    //   // username
    //      // update
    //   // avatar
    //      // update
    //   // 2fa
    //      // turnOff/OnTwoFA
    //   // return user;
    // }

  }